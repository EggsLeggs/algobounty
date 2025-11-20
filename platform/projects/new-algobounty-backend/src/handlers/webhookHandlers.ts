import { Octokit } from "@octokit/rest";
import type { EmitterWebhookEvent } from "@octokit/webhooks";
import { markIssueClosed } from "../services/bountyService.js";

type IssueOpenedPayload = EmitterWebhookEvent<"issues.opened">["payload"];
type IssueClosedPayload = EmitterWebhookEvent<"issues.closed">["payload"];
type PullRequestClosedPayload = EmitterWebhookEvent<"pull_request.closed">["payload"];

export async function handleIssueOpened(payload: IssueOpenedPayload, octokit: Octokit) {
  const { issue, repository, installation } = payload;

  console.log(`🔍 Processing new issue #${issue.number} in ${repository.full_name}`);

  if (!installation) {
    console.log("⚠️ No installation ID provided, skipping bounty link addition");
    return;
  }

  try {
    // Check if repository is public
    const [owner, repo] = repository.full_name.split("/");
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    if (repoInfo.data.private) {
      console.log(`🔒 Repository ${repository.full_name} is private, skipping bounty link addition`);
      return;
    }

    console.log(`🌐 Repository ${repository.full_name} is public, proceeding with bounty link addition`);

    // Generate image URL for the bounty button (point to backend)
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    const imageUrl = `${backendUrl}/api/bounty-image.svg?repoId=${repository.id}&issue=${issue.number}`;
    const fundingUrl = `${frontendUrl}/fund/${repository.owner.login}/${repository.name}/${repository.id}/issue/${issue.number}`;

    // Create clickable image markdown link
    const bountyLink = `[![Fund this bounty](${imageUrl})](${fundingUrl})`;

    // Check if bounty link already exists (check for image pattern or old text pattern)
    if (issue.body && (issue.body.includes(imageUrl) || issue.body.includes("Fund this bounty"))) {
      console.log(`✅ Bounty link already exists in issue #${issue.number}, skipping update`);
      return;
    }

    // Update issue description with bounty link
    const updatedBody = `${bountyLink}\n\n---\n\n${issue.body || ""}`;

    await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
      owner,
      repo,
      issue_number: issue.number,
      body: updatedBody,
    });

    console.log(`✅ Successfully added bounty link to issue #${issue.number}`);
  } catch (error) {
    console.error(`❌ Failed to add bounty link to issue #${issue.number}:`, error);
  }
}

export async function handleIssueClosed(payload: IssueClosedPayload, octokit: Octokit) {
  const { issue, repository, installation } = payload;

  console.log(`🔍 Processing closed issue #${issue.number} in ${repository.full_name}`);

  if (!installation) {
    console.log("⚠️ No installation ID provided, skipping award message addition");
    return;
  }

  // Check if this issue has a bounty link (was funded)
  // TODO: Implement proper check
  if (!issue.body || !issue.body.includes("Fund this bounty")) {
    console.log(`ℹ️ Issue #${issue.number} doesn't have a bounty link, skipping award message`);
    return;
  }

  try {
    const [owner, repo] = repository.full_name.split("/");
    const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    if (repoInfo.data.private) {
      console.log(`🔒 Repository ${repository.full_name} is private, skipping award message addition`);
      return;
    }

    try {
      await markIssueClosed(repository.owner.login, repository.name, issue.number.toString());
      console.log(`✅ Marked ${repository.full_name}#${issue.number} as closed on-chain`);
    } catch (error) {
      console.error("❌ Failed to mark bounty closed on-chain:", error);
    }

    const awardLink = `[Award Bounty](${process.env.CORS_ORIGIN || "http://localhost:3000"}/award/${repository.full_name}/${issue.number})`;

    const awardMessage = `## 🏆 Issue Resolved - Award Bounty

This issue has been closed and appears to be resolved! If this issue had a bounty, maintainers can now award it to the contributor who resolved it.

${awardLink}

---

*This message was automatically added by AlgoBounty when the issue was closed.*`;

    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner,
      repo,
      issue_number: issue.number,
      body: awardMessage,
    });

    console.log(`✅ Successfully added award message to issue #${issue.number}`);
  } catch (error) {
    console.error(`❌ Failed to add award message to issue #${issue.number}:`, error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handlePullRequestMerged(payload: PullRequestClosedPayload, octokit: Octokit) {
  const { pull_request, repository } = payload;

  console.log(`PR #${pull_request.number} merged in ${repository.full_name}`);
  // TODO: Find associated issue and trigger bounty distribution
}
