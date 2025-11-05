import { NextRequest, NextResponse } from "next/server";
import { submitLinkTransaction, ContractConfig } from "@/lib/smart-contract";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubId, algorandAddress, expiry, nonce, attestorPubkey, signature } = body;

    if (!githubId || !algorandAddress || !expiry || !nonce || !attestorPubkey || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Contract configuration
    const contractConfig: ContractConfig = {
      appId: parseInt(process.env.SMART_CONTRACT_APP_ID || "0"),
      appAddress: process.env.SMART_CONTRACT_APP_ADDRESS || "",
      algodServer: process.env.NEXT_PUBLIC_ALGOD_SERVER || "http://localhost:4001",
      algodToken: process.env.NEXT_PUBLIC_ALGOD_TOKEN || "",
      backendPrivateKey: process.env.BACKEND_PRIVATE_KEY || "",
    };

    // Validate configuration
    if (!contractConfig.appId || !contractConfig.backendPrivateKey) {
      return NextResponse.json({ error: "Smart contract not configured" }, { status: 500 });
    }

    // Submit the link transaction
    const result = await submitLinkTransaction(
      {
        githubId,
        algorandAddress,
        expiry,
        nonce,
        attestorPubkey,
        signature,
      },
      contractConfig
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        txId: result.txId,
        message: "GitHub account linked successfully on-chain",
      });
    } else {
      return NextResponse.json({ error: result.error || "Failed to submit link transaction" }, { status: 500 });
    }
  } catch (error) {
    console.error("Link transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
