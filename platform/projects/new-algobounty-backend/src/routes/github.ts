import { Router } from "express";
import { App } from "@octokit/app";
import type { Octokit } from "@octokit/rest";

export const githubRouter = Router();

// Get GitHub user by ID
githubRouter.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const response = await fetch(`https://api.github.com/user/${userId}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AlgoBounty-Backend",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "GitHub user not found" });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const userData = (await response.json()) as {
      id: number;
      login: string;
      name?: string;
      avatar_url: string;
      html_url: string;
    };

    res.json({
      id: userData.id,
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
    });
  } catch (error) {
    console.error("GitHub user fetch error:", error);
    res.status(500).json({ error: "Failed to fetch GitHub user" });
  }
});

// Get issue information (requires installation)
githubRouter.get("/issue/:owner/:repo/:issueNumber", async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const installationId = req.query.installationId as string;

    if (!installationId) {
      return res.status(400).json({ error: "Installation ID required" });
    }

    // Create GitHub App instance (lazy initialization, like in original frontend)
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });

    const octokit = (await app.getInstallationOctokit(parseInt(installationId))) as Octokit;

    const { data: issue } = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: parseInt(issueNumber),
    });

    res.json({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      html_url: issue.html_url,
      user: issue.user,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  } catch (error) {
    console.error("GitHub issue fetch error:", error);
    res.status(500).json({ error: "Failed to fetch GitHub issue" });
  }
});

// Check if GitHub account is linked to Algorand address
githubRouter.get("/check-link/:githubId", async (req, res) => {
  try {
    const githubId = parseInt(req.params.githubId);
    if (isNaN(githubId)) {
      return res.status(400).json({ error: "Invalid GitHub ID" });
    }
    // TODO: Implement real smart contract - check GitHub account link to Algorand address
    // Using githubId for validation above
    res.json({ linked: false, algorandAddress: null, githubId });
  } catch (error) {
    console.error("Check link error:", error);
    res.status(500).json({ error: "Failed to check link" });
  }
});
