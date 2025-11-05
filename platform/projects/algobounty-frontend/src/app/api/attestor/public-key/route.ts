import { NextResponse } from "next/server";
import { getAttestorPublicKey } from "@/lib/attestor-key";

export async function GET() {
  try {
    const publicKey = getAttestorPublicKey();

    return NextResponse.json({
      publicKey,
      algorithm: "Ed25519",
      format: "base64",
    });
  } catch (error) {
    console.error("Error getting attestor public key:", error);
    return NextResponse.json({ error: "Failed to get attestor public key" }, { status: 500 });
  }
}
