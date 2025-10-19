import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueUrl = searchParams.get("url");
    const overrideRateLimit = searchParams.get("overrideRateLimit") === "true";

    if (!issueUrl) {
      return NextResponse.json({ error: "GitHub issue URL is required" }, { status: 400 });
    }

    // Parse GitHub issue URL to extract owner, repo, and issue number
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)$/;
    const match = issueUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub issue URL format" }, { status: 400 });
    }

    const [, owner, repo, issueNumber] = match;

    // If override is requested, return mock data with a warning
    if (overrideRateLimit) {
      const mockIssueData = {
        title: `Issue #${issueNumber} (Rate Limit Override)`,
        body: "⚠️ RATE LIMIT OVERRIDE: Issue details could not be fetched due to GitHub API rate limiting. Please verify this issue offers an AlgoBounty before proceeding.",
        number: parseInt(issueNumber),
        state: "open",
        user: { login: "unknown", avatar_url: "" },
        html_url: issueUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return processIssueData(mockIssueData, owner, repo);
    }

    // Simple fetch to GitHub API for open source repositories
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AlgoBounty/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Issue not found or repository is private" }, { status: 404 });
      }
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "GitHub API rate limit exceeded. Please wait a few minutes and try again.",
            rateLimitExceeded: true,
            overrideAvailable: true,
            message: "If you confirm that this issue offers an AlgoBounty, you can override this error and proceed with creating a bounty.",
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Failed to fetch issue details" }, { status: response.status });
    }

    const issueData = await response.json();
    return processIssueData(issueData, owner, repo);
  } catch (error) {
    console.error("Error fetching GitHub issue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function processIssueData(
  issueData: {
    title: string;
    body?: string;
    number: number;
    state?: string;
    html_url: string;
    user?: {
      login: string;
      avatar_url: string;
    };
    created_at?: string;
    updated_at?: string;
  },
  owner: string,
  repo: string
) {
  // Debug logging to understand the response structure
  console.log("GitHub API response:", {
    hasTitle: !!issueData.title,
    hasNumber: !!issueData.number,
    hasUser: !!issueData.user,
    userKeys: issueData.user ? Object.keys(issueData.user) : [],
    allKeys: Object.keys(issueData),
  });

  // Validate required fields
  if (!issueData.title || !issueData.number || !issueData.user) {
    return NextResponse.json({ error: "Invalid issue data received from GitHub" }, { status: 500 });
  }

  // Extract repository info from URL since it might not be in the response
  const repositoryFullName = `${owner}/${repo}`;

  // Return formatted issue data
  return NextResponse.json({
    title: issueData.title,
    description: issueData.body || "No description provided",
    number: issueData.number,
    state: issueData.state || "unknown",
    url: issueData.html_url,
    author: {
      username: issueData.user?.login || "unknown",
      avatar: issueData.user?.avatar_url || "",
    },
    repository: {
      fullName: repositoryFullName,
      name: repo,
      owner: owner,
    },
    createdAt: issueData.created_at || new Date().toISOString(),
    updatedAt: issueData.updated_at || new Date().toISOString(),
  });
}
