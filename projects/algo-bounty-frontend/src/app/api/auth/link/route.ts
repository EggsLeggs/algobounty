import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { storeNonce, getNonce } from "@/lib/nonce-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubId, algorandAddress } = body;

    if (!githubId || !algorandAddress) {
      return NextResponse.json({ error: "GitHub ID and Algorand address are required" }, { status: 400 });
    }

    // Generate a random nonce for wallet signing
    const nonce = randomBytes(32).toString("hex");

    // Store nonce with expiration (10 minutes)
    await storeNonce(nonce, parseInt(githubId), 10);

    return NextResponse.json({
      nonce,
      message: "Please sign this nonce with your Algorand wallet to complete the linking process",
    });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nonce = searchParams.get("nonce");

    if (!nonce) {
      return NextResponse.json({ error: "Nonce is required" }, { status: 400 });
    }

    const nonceData = await getNonce(nonce);

    if (!nonceData) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      githubId: nonceData.githubId,
      expires: nonceData.expires,
    });
  } catch (error) {
    console.error("Error verifying nonce:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
