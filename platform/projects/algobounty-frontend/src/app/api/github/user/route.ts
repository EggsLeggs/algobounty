import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const githubId = searchParams.get("id");

    if (!githubId) {
      return NextResponse.json({ error: "GitHub ID is required" }, { status: 400 });
    }

    // Fetch user info from GitHub API
    const response = await fetch(`https://api.github.com/user/${githubId}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Algorand-Bounty-System',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const userData = await response.json();

    return NextResponse.json({
      id: userData.id,
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
    });
  } catch (error) {
    console.error("GitHub user fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch GitHub user" }, { status: 500 });
  }
}
