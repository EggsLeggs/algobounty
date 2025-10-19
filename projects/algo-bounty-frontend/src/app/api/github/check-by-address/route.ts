import { NextRequest, NextResponse } from "next/server";
import { getGitHubLinkByAddress } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const algorandAddress = searchParams.get("address");

    if (!algorandAddress) {
      return NextResponse.json({ error: "Algorand address is required" }, { status: 400 });
    }

    // Check MongoDB for existing link
    const link = await getGitHubLinkByAddress(algorandAddress);

    if (link) {
      return NextResponse.json({
        isLinked: true,
        githubId: link.github_id,
        algorandAddress: link.algorand_address,
        githubUser: {
          id: link.github_id,
          login: link.github_username,
          name: link.github_name,
          avatar_url: link.github_avatar_url,
          html_url: link.github_html_url,
        },
      });
    }

    // No link found
    return NextResponse.json({
      isLinked: false,
      algorandAddress,
    });
  } catch (error) {
    console.error("Check by address error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
