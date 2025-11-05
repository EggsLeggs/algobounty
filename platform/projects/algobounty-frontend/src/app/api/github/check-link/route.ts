import { NextRequest, NextResponse } from "next/server";
import { getGitHubLinkById } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const githubId = searchParams.get("githubId");

    if (!githubId) {
      return NextResponse.json({ error: "GitHub ID is required" }, { status: 400 });
    }

    // Check MongoDB for existing link
    const link = await getGitHubLinkById(parseInt(githubId));

    if (link) {
      return NextResponse.json({
        isLinked: true,
        algorandAddress: link.algorand_address,
        githubId: link.github_id,
      });
    } else {
      return NextResponse.json({
        isLinked: false,
        githubId: parseInt(githubId),
      });
    }
  } catch (error) {
    console.error("Check link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
