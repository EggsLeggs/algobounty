import { Router } from "express";
import { OAuthApp } from "@octokit/oauth-app";
import { Octokit } from "@octokit/rest";

export const authRouter = Router();

// Initialize OAuth App (lazy initialization - only when needed)
// Note: We check at runtime in route handlers, not at module load time
const GITHUB_APP_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
const GITHUB_APP_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET;

let oauthApp: OAuthApp | null = null;
if (GITHUB_APP_CLIENT_ID && GITHUB_APP_CLIENT_SECRET) {
  try {
    oauthApp = new OAuthApp({
      clientId: GITHUB_APP_CLIENT_ID,
      clientSecret: GITHUB_APP_CLIENT_SECRET,
    });
  } catch (error) {
    console.error("Failed to initialize OAuth App:", error);
  }
}

// Get OAuth authorization URL
authRouter.get("/github", (req, res) => {
  try {
    if (!oauthApp) {
      return res.status(503).json({ error: "OAuth App not configured" });
    }

    const state = (req.query.state as string) || "default";
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || "http://localhost:3001/api/auth/github/callback";

    const { url } = oauthApp.getWebFlowAuthorizationUrl({
      redirectUrl: redirectUri,
      state,
      scopes: ["user:email"],
    });

    res.json({ authUrl: url });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    res.status(500).json({ error: "Failed to generate OAuth URL" });
  }
});

// OAuth callback handler
authRouter.get("/github/callback", async (req, res) => {
  try {
    if (!oauthApp) {
      return res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:3000"}?error=oauth_not_configured`);
    }

    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) {
      return res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:3000"}?error=oauth_cancelled`);
    }

    // Exchange code for token
    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || "http://localhost:3001/api/auth/github/callback";
    const { authentication } = await oauthApp.createToken({
      code,
      state,
      redirectUrl: redirectUri,
    });

    // Get user information
    const octokit = new Octokit({ auth: authentication.token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // TODO: Implement real smart contract - store GitHub account link to Algorand address
    // For now, redirect with user data
    const redirectUrl = new URL(process.env.CORS_ORIGIN || "http://localhost:3000");
    redirectUrl.searchParams.set("github_linked", "true");
    redirectUrl.searchParams.set("github_id", user.id.toString());
    redirectUrl.searchParams.set("github_username", user.login);
    redirectUrl.searchParams.set("github_name", user.name || "");
    redirectUrl.searchParams.set("github_avatar", user.avatar_url);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:3000"}?error=oauth_failed`);
  }
});
