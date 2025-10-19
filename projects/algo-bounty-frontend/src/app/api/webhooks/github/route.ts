import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { App } from "@octokit/app";
import {
  generateBountyLink,
  hasBountyLink,
  generateAwardLink,
} from "@/lib/bounty-utils";

// GitHub webhook secret for verification
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

interface GitHubWebhookPayload {
  action: string;
  issue?: {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    body: string;
  };
  pull_request?: {
    id: number;
    number: number;
    title: string;
    state: string;
    merged: boolean;
    html_url: string;
    head: {
      ref: string;
    };
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
  };
  installation?: {
    id: number;
  };
}

function verifyGitHubWebhook(payload: string, signature: string): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn("GitHub webhook secret not configured");
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac("sha256", GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const providedSignature = signature.replace("sha256=", "");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(providedSignature, "hex")
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-hub-signature-256") || "";

    // Verify webhook signature
    if (!verifyGitHubWebhook(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data: GitHubWebhookPayload = JSON.parse(payload);

    console.log("GitHub webhook received:", {
      action: data.action,
      repository: data.repository.full_name,
      issue: data.issue?.number,
      pull_request: data.pull_request?.number,
      installation: data.installation?.id,
      timestamp: new Date().toISOString(),
    });

    // Handle different webhook events
    switch (data.action) {
      case "opened":
        if (data.issue) {
          // New issue opened - add bounty funding link
          await handleIssueOpened(
            data.issue,
            data.repository,
            data.installation?.id
          );
        }
        break;

      case "closed":
        if (data.issue) {
          // Issue closed - add award message
          await handleIssueClosed(
            data.issue,
            data.repository,
            data.installation?.id
          );
        } else if (data.pull_request && data.pull_request.merged) {
          // PR merged - trigger bounty distribution
          await handlePullRequestMerged(data.pull_request, data.repository);
        }
        break;

      default:
        console.log("Unhandled webhook action:", data.action);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleIssueOpened(
  issue: { number: number; title: string; body: string },
  repository: { full_name: string },
  installationId?: number
) {
  console.log(
    `🔍 Processing new issue #${issue.number} in ${repository.full_name}:`,
    {
      title: issue.title,
      hasBody: !!issue.body,
      bodyLength: issue.body?.length || 0,
      installationId,
      timestamp: new Date().toISOString(),
    }
  );

  if (!installationId) {
    console.log(
      "⚠️ No installation ID provided, skipping bounty link addition"
    );
    return;
  }

  try {
    // Create GitHub App instance
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });

    // Get installation access token
    const octokit = await app.getInstallationOctokit(installationId);

    // Check if repository is public
    const [owner, repo] = repository.full_name.split("/");
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    if (repoInfo.data.private) {
      console.log(
        `🔒 Repository ${repository.full_name} is private, skipping bounty link addition`
      );
      return;
    }

    console.log(
      `🌐 Repository ${repository.full_name} is public, proceeding with bounty link addition`
    );

    // Create bounty funding link using common function
    const bountyLink = generateBountyLink(repository.full_name, issue.number);

    // Check if bounty link already exists in the issue body
    if (issue.body && hasBountyLink(issue.body)) {
      console.log(
        `✅ Bounty link already exists in issue #${issue.number}, skipping update`
      );
      return;
    }

    // Update issue description with bounty link at the top
    const updatedBody = `${bountyLink}\n\n---\n\n${issue.body || ""}`;

    console.log(`📝 Updating issue #${issue.number} with bounty link:`, {
      originalBodyLength: issue.body?.length || 0,
      newBodyLength: updatedBody.length,
      bountyLink,
    });

    await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
      owner: repository.full_name.split("/")[0],
      repo: repository.full_name.split("/")[1],
      issue_number: issue.number,
      body: updatedBody,
    });

    console.log(
      `✅ Successfully added bounty link to issue #${issue.number} in ${repository.full_name}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to add bounty link to issue #${issue.number} in ${repository.full_name}:`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        issueNumber: issue.number,
        repository: repository.full_name,
        timestamp: new Date().toISOString(),
      }
    );
  }
}

async function handleIssueClosed(
  issue: { number: number; title: string; body: string },
  repository: { full_name: string },
  installationId?: number
) {
  console.log(
    `🔍 Processing closed issue #${issue.number} in ${repository.full_name}:`,
    {
      title: issue.title,
      installationId,
      timestamp: new Date().toISOString(),
    }
  );

  if (!installationId) {
    console.log(
      "⚠️ No installation ID provided, skipping award message addition"
    );
    return;
  }

  // Check if this issue has a bounty link (was funded)
  if (!issue.body || !hasBountyLink(issue.body)) {
    console.log(
      `ℹ️ Issue #${issue.number} doesn't have a bounty link, skipping award message`
    );
    return;
  }

  try {
    // Create GitHub App instance
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });

    // Get installation access token
    const octokit = await app.getInstallationOctokit(installationId);

    // Check if repository is public
    const [owner, repo] = repository.full_name.split("/");
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    if (repoInfo.data.private) {
      console.log(
        `🔒 Repository ${repository.full_name} is private, skipping award message addition`
      );
      return;
    }

    console.log(
      `🌐 Repository ${repository.full_name} is public, proceeding with award message addition`
    );

    // Generate award link
    const awardLink = generateAwardLink(repository.full_name, issue.number);

    // Create award message
    const awardMessage = `## 🏆 Issue Resolved - Award Bounty

This issue has been closed and appears to be resolved! If this issue had a bounty, maintainers can now award it to the contributor who resolved it.

${awardLink}

---

*This message was automatically added by AlgoBounty when the issue was closed.*`;

    console.log(`📝 Adding award message to issue #${issue.number}:`, {
      awardLink,
      messageLength: awardMessage.length,
    });

    // Add comment to the issue
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: repository.full_name.split("/")[0],
        repo: repository.full_name.split("/")[1],
        issue_number: issue.number,
        body: awardMessage,
      }
    );

    console.log(
      `✅ Successfully added award message to issue #${issue.number} in ${repository.full_name}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to add award message to issue #${issue.number} in ${repository.full_name}:`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        issueNumber: issue.number,
        repository: repository.full_name,
        timestamp: new Date().toISOString(),
      }
    );
  }
}

async function handlePullRequestMerged(
  pullRequest: { number: number; title: string },
  repository: { full_name: string }
) {
  console.log(`PR #${pullRequest.number} merged in ${repository.full_name}`);
  // TODO: Find associated issue and trigger bounty distribution
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: "GitHub webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
