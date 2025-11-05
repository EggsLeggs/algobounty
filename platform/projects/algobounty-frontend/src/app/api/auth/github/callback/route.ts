import { NextRequest, NextResponse } from "next/server";

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    // const state = searchParams.get("state"); // Unused for now

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_cancelled`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    // Fetch user information from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AlgoBounty/1.0",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information");
    }

    const userData: GitHubUser = await userResponse.json();

    // For now, we'll store the user data in a simple way
    // In a production app, you'd want to store this in a database
    // and create a proper session management system

    // Create a temporary session token (in production, use proper JWT or session management)
    // const sessionData = {
    //   githubId: userData.id,
    //   githubUsername: userData.login,
    //   githubName: userData.name,
    //   githubEmail: userData.email,
    //   githubAvatar: userData.avatar_url,
    //   accessToken: tokenData.access_token,
    //   linkedAt: new Date().toISOString(),
    // };

    // In a real app, you'd store this in a database and return a session token
    // For now, we'll redirect with the data as URL parameters (not secure for production)
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/`);
    redirectUrl.searchParams.set("github_linked", "true");
    redirectUrl.searchParams.set("github_id", userData.id.toString());
    redirectUrl.searchParams.set("github_username", userData.login);
    redirectUrl.searchParams.set("github_name", userData.name || "");
    redirectUrl.searchParams.set("github_avatar", userData.avatar_url);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_failed`);
  }
}
