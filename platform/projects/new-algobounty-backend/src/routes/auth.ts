import { Router } from "express";
import { OAuthApp } from "@octokit/oauth-app";
import { Octokit } from "@octokit/rest";
import { isDemoMode } from "../config/env.js";
import {
  getDemoAttestationStatesCollection,
  getDemoAttestationsCollection,
} from "../lib/demoCollections.js";
import { createAttestationPayload, signAttestation } from "../lib/attestation.js";

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

async function linkDemoAttestation(state: string | undefined, githubId: number, githubUsername: string) {
  if (!isDemoMode || !state) {
    return null;
  }

  const statesCollection = await getDemoAttestationStatesCollection();
  const stateRecord = await statesCollection.findOne({ state });
  if (!stateRecord) {
    console.warn("Demo attestation state not found or expired");
    return null;
  }

  await statesCollection.deleteOne({ state });

  const privateKeyBase64 = process.env.ATTESTOR_PRIVATE_KEY;
  if (!privateKeyBase64) {
    console.warn("ATTESTOR_PRIVATE_KEY is not configured; skipping demo attestation storage");
    return null;
  }

  const privateKey = Buffer.from(privateKeyBase64, "base64");
  const payload = createAttestationPayload(githubId, stateRecord.algorandAddress, state, 24);
  const attestation = signAttestation(payload, privateKey);

  const attestationsCollection = await getDemoAttestationsCollection();
  const now = new Date();
  await attestationsCollection.updateOne(
    { algorandAddress: stateRecord.algorandAddress },
    {
      $set: {
        githubId: githubId.toString(),
        githubUsername,
        algorandAddress: stateRecord.algorandAddress,
        attestation,
        createdAt: now,
        githubLinkedAt: now,
        attestationSignedAt: now,
        storedAt: now,
      },
    },
    { upsert: true },
  );

  return stateRecord.algorandAddress;
}

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

    const redirectUrl = new URL(process.env.CORS_ORIGIN || "http://localhost:3000");
    redirectUrl.searchParams.set("github_linked", "true");
    redirectUrl.searchParams.set("github_id", user.id.toString());
    redirectUrl.searchParams.set("github_username", user.login);
    redirectUrl.searchParams.set("github_name", user.name || "");
    redirectUrl.searchParams.set("github_avatar", user.avatar_url);

    const linkedAddress = await linkDemoAttestation(state, user.id, user.login);
    if (linkedAddress) {
      redirectUrl.searchParams.set("demo_linked", "true");
      redirectUrl.searchParams.set("demo_algorand_address", linkedAddress);
    }

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.CORS_ORIGIN || "http://localhost:3000"}?error=oauth_failed`);
  }
});
