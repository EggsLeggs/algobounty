import { Router } from "express";
import { Webhooks } from "@octokit/webhooks";
import { App } from "@octokit/app";
import type { Octokit } from "@octokit/rest";
import { handleIssueOpened, handleIssueClosed, handlePullRequestMerged } from "../handlers/webhookHandlers.js";

export const webhookRouter = Router();

// Lazy initialization function for webhooks
let webhooksInstance: Webhooks | null = null;

function getWebhooks(): Webhooks | null {
  if (!webhooksInstance) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret) {
      webhooksInstance = new Webhooks({ secret });
      // Register event handlers on first initialization
      webhooksInstance.on("issues.opened", async ({ payload }) => {
        if (!payload.installation?.id) {
          console.log("⚠️ No installation ID provided, skipping bounty link addition");
          return;
        }

        try {
          // Create GitHub App instance (lazy initialization, like in original frontend)
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });

          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handleIssueOpened(payload, octokit);
        } catch (error) {
          console.error("Error handling issue opened:", error);
        }
      });

      webhooksInstance.on("issues.closed", async ({ payload }) => {
        if (!payload.installation?.id) {
          console.log("⚠️ No installation ID provided, skipping award message addition");
          return;
        }

        try {
          // Create GitHub App instance (lazy initialization, like in original frontend)
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });

          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handleIssueClosed(payload, octokit);
        } catch (error) {
          console.error("Error handling issue closed:", error);
        }
      });

      webhooksInstance.on("pull_request.closed", async ({ payload }) => {
        if (!payload.pull_request.merged || !payload.installation?.id) {
          return;
        }

        try {
          // Create GitHub App instance (lazy initialization, like in original frontend)
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });

          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handlePullRequestMerged(payload, octokit);
        } catch (error) {
          console.error("Error handling pull request merged:", error);
        }
      });
    }
  }
  return webhooksInstance;
}

// Webhook endpoint
webhookRouter.post("/github", async (req, res) => {
  try {
    const id = req.headers["x-github-delivery"] as string;
    const name = req.headers["x-github-event"] as string;
    const signature = req.headers["x-hub-signature-256"] as string;

    if (!id || !name) {
      return res.status(400).json({ error: "Missing required headers" });
    }

    // Verify and handle webhook (lazy initialization ensures env vars are loaded)
    const webhooks = getWebhooks();
    if (webhooks) {
      // req.body is a Buffer from express.raw(), convert to string for verification
      const rawBody = typeof req.body === "string" ? req.body : req.body.toString();
      await webhooks.verifyAndReceive({
        id,
        name,
        signature,
        payload: rawBody,
      });
    } else {
      console.warn("⚠️  Webhook received but verification skipped (GITHUB_WEBHOOK_SECRET not set)");
      // Manually trigger handlers based on event type
      // req.body is a Buffer from express.raw(), convert to string then parse
      const rawBody = typeof req.body === "string" ? req.body : req.body.toString();
      const payload = JSON.parse(rawBody);
      if (name === "issues" && payload.action === "opened" && payload.installation?.id) {
        try {
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });
          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handleIssueOpened(payload, octokit);
        } catch (error) {
          console.error("Error handling issue opened:", error);
        }
      } else if (name === "issues" && payload.action === "closed" && payload.installation?.id) {
        try {
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });
          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handleIssueClosed(payload, octokit);
        } catch (error) {
          console.error("Error handling issue closed:", error);
        }
      } else if (name === "pull_request" && payload.action === "closed" && payload.pull_request?.merged && payload.installation?.id) {
        try {
          const app = new App({
            appId: process.env.GITHUB_APP_ID!,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
          });
          const octokit = (await app.getInstallationOctokit(payload.installation.id)) as Octokit;
          await handlePullRequestMerged(payload, octokit);
        } catch (error) {
          console.error("Error handling pull request merged:", error);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    if (error instanceof Error && error.message.includes("signature")) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Health check for webhook endpoint
webhookRouter.get("/github", (req, res) => {
  res.json({ message: "GitHub webhook endpoint is active" });
});
