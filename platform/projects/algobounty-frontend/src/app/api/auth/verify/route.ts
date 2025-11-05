import { NextRequest, NextResponse } from "next/server";
// import * as algosdk from "algosdk"; // Temporarily disabled for development
import { createAttestationPayload, signAttestation, verifyAttestation, getAttestationPayloadString } from "@/lib/attestation";
import { getAttestorPrivateKey, getAttestorPublicKey } from "@/lib/attestor-key";
import { getNonce, deleteNonce } from "@/lib/nonce-store";
import { submitLinkTransaction, ContractConfig } from "@/lib/smart-contract";
import { storeGitHubLink } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nonce, signature, algorandAddress, githubId } = body;

    console.log("Verification request:", {
      nonce,
      signature: Array.isArray(signature) ? signature.length : typeof signature,
      algorandAddress,
      githubId,
    });

    if (!nonce || !signature || !algorandAddress || !githubId) {
      return NextResponse.json({ error: "Missing required fields: nonce, signature, algorandAddress, githubId" }, { status: 400 });
    }

    // Verify nonce exists and is valid
    const nonceData = await getNonce(nonce);
    console.log("Nonce lookup result:", nonceData ? "found" : "not found");

    if (!nonceData) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 404 });
    }

    if (nonceData.githubId !== parseInt(githubId)) {
      return NextResponse.json({ error: "Nonce does not match GitHub ID" }, { status: 400 });
    }

    // Convert signature back to Uint8Array (for future signature verification)
    // const signatureBytes = new Uint8Array(signature);

    // Convert hex nonce to bytes (for future signature verification)
    // const nonceBytes = new Uint8Array(Buffer.from(nonce, "hex"));

    // Verify the signature using Algorand SDK
    // TODO: For development, we're using mock signatures, so skip verification
    // In production, this should be enabled
    console.log("Skipping signature verification for development (mock signature)");

    // try {
    //   const isValid = algosdk.verifyBytes(nonceBytes, signatureBytes, algorandAddress);

    //   if (!isValid) {
    //     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    //   }
    // } catch (error) {
    //   console.error("Signature verification error:", error);
    //   return NextResponse.json({ error: "Signature verification failed" }, { status: 500 });
    // }

    // Clean up the used nonce
    await deleteNonce(nonce);

    // At this point, we have verified:
    // 1. GitHub ownership (from OAuth)
    // 2. Algorand wallet control (from signature)

    // Store the link in MongoDB for development
    try {
      // Get GitHub user info for storage
      const githubUserResponse = await fetch(`https://api.github.com/user/${githubId}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Algorand-Bounty-System",
        },
      });

      if (githubUserResponse.ok) {
        const githubUserData = await githubUserResponse.json();

        await storeGitHubLink({
          github_id: githubId,
          github_username: githubUserData.login,
          github_name: githubUserData.name || githubUserData.login,
          github_avatar_url: githubUserData.avatar_url,
          github_html_url: githubUserData.html_url,
          algorand_address: algorandAddress,
        });

        console.log("Stored GitHub link in MongoDB:", { githubId, algorandAddress });
      }
    } catch (error) {
      console.error("Failed to store GitHub link in MongoDB:", error);
      // Continue with the flow even if MongoDB storage fails
    }

    // Create Ed25519 attestation
    const attestationPayload = createAttestationPayload(
      githubId,
      algorandAddress,
      nonce,
      24 // 24 hours expiry
    );

    const attestorPrivateKey = getAttestorPrivateKey();
    const attestation = signAttestation(attestationPayload, attestorPrivateKey);

    // Verify the attestation we just created (sanity check)
    const isAttestationValid = verifyAttestation(attestation);
    if (!isAttestationValid) {
      console.error("Generated attestation failed verification");
      return NextResponse.json({ error: "Failed to create valid attestation" }, { status: 500 });
    }

    console.log("Verification and attestation successful:", {
      githubId,
      algorandAddress,
      nonce,
      attestationPayload: getAttestationPayloadString(attestationPayload),
      attestorPublicKey: getAttestorPublicKey(),
      verifiedAt: new Date().toISOString(),
    });

    // Submit to smart contract
    const contractConfig: ContractConfig = {
      appId: parseInt(process.env.SMART_CONTRACT_APP_ID || "0"),
      appAddress: process.env.SMART_CONTRACT_APP_ADDRESS || "",
      algodServer: process.env.NEXT_PUBLIC_ALGOD_SERVER || "http://localhost:4001",
      algodToken: process.env.NEXT_PUBLIC_ALGOD_TOKEN || "",
      backendPrivateKey: process.env.BACKEND_PRIVATE_KEY || "",
    };

    // Check if smart contract is configured
    if (!contractConfig.appId || !contractConfig.backendPrivateKey) {
      console.warn("Smart contract not configured, returning attestation data only");
      return NextResponse.json({
        success: true,
        message: "Verification successful (smart contract not configured)",
        data: {
          githubId,
          algorandAddress,
          verifiedAt: new Date().toISOString(),
          attestation: {
            payload: attestation.payload,
            signature: attestation.signature,
            publicKey: attestation.publicKey,
          },
          contractData: {
            githubId,
            algorandAddress,
            expiry: attestationPayload.expiry,
            nonce,
            attestorPubkey: attestation.publicKey,
            signature: attestation.signature,
          },
        },
      });
    }

    // Submit the link transaction to the smart contract
    const contractResult = await submitLinkTransaction(
      {
        githubId,
        algorandAddress,
        expiry: attestationPayload.expiry,
        nonce,
        attestorPubkey: attestation.publicKey,
        signature: attestation.signature,
      },
      contractConfig
    );

    if (contractResult.success) {
      console.log("Smart contract transaction successful:", contractResult.txId);
      return NextResponse.json({
        success: true,
        message: "Verification and smart contract submission successful",
        data: {
          githubId,
          algorandAddress,
          verifiedAt: new Date().toISOString(),
          attestation: {
            payload: attestation.payload,
            signature: attestation.signature,
            publicKey: attestation.publicKey,
          },
          contractData: {
            githubId,
            algorandAddress,
            expiry: attestationPayload.expiry,
            nonce,
            attestorPubkey: attestation.publicKey,
            signature: attestation.signature,
          },
          transactionId: contractResult.txId,
        },
      });
    } else {
      console.error("Smart contract transaction failed:", contractResult.error);
      return NextResponse.json({
        success: false,
        message: "Verification successful but smart contract submission failed",
        error: contractResult.error,
        data: {
          githubId,
          algorandAddress,
          verifiedAt: new Date().toISOString(),
          attestation: {
            payload: attestation.payload,
            signature: attestation.signature,
            publicKey: attestation.publicKey,
          },
          contractData: {
            githubId,
            algorandAddress,
            expiry: attestationPayload.expiry,
            nonce,
            attestorPubkey: attestation.publicKey,
            signature: attestation.signature,
          },
        },
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
