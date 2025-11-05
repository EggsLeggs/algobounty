import { NextRequest, NextResponse } from "next/server";

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error("GitHub OAuth credentials not configured");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");

    // Generate GitHub OAuth URL
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
    githubAuthUrl.searchParams.set("client_id", GITHUB_CLIENT_ID!);
    githubAuthUrl.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI!);
    githubAuthUrl.searchParams.set("scope", "user:email");
    githubAuthUrl.searchParams.set("state", state || "default");

    return NextResponse.json({
      authUrl: githubAuthUrl.toString(),
    });
  } catch (error) {
    console.error("Error generating GitHub OAuth URL:", error);
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 });
  }
}
