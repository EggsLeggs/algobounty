import { generateAttestorKeypair } from "./attestation";
import * as nacl from "tweetnacl";

/**
 * Attestor keypair management
 * In production, this should be stored securely (e.g., environment variables, HSM, etc.)
 */

// For development, we'll generate a keypair and store it in memory
// In production, load from secure storage
let attestorKeypair: { publicKey: Uint8Array; privateKey: Uint8Array } | null = null;

/**
 * Get or generate the attestor keypair
 */
export function getAttestorKeypair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
  if (!attestorKeypair) {
    // In production, load from environment variable or secure storage
    const privateKeyEnv = process.env.ATTESTOR_PRIVATE_KEY;

    if (privateKeyEnv) {
      // Load from environment variable (base64 encoded)
      const privateKey = Buffer.from(privateKeyEnv, "base64");
      const keypair = nacl.sign.keyPair.fromSecretKey(privateKey);
      attestorKeypair = {
        publicKey: keypair.publicKey,
        privateKey: keypair.secretKey,
      };
    } else {
      // Generate new keypair for development
      console.warn("ATTESTOR_PRIVATE_KEY not found in environment. Generating new keypair for development.");
      attestorKeypair = generateAttestorKeypair();

      // Log the keypair for development (DO NOT do this in production!)
      console.log("Development Attestor Keypair:");
      console.log("Public Key (base64):", Buffer.from(attestorKeypair.publicKey).toString("base64"));
      console.log("Private Key (base64):", Buffer.from(attestorKeypair.privateKey).toString("base64"));
      console.log("Add this to your .env.local:");
      console.log(`ATTESTOR_PRIVATE_KEY=${Buffer.from(attestorKeypair.privateKey).toString("base64")}`);
    }
  }

  return attestorKeypair;
}

/**
 * Get the attestor public key as base64 string
 */
export function getAttestorPublicKey(): string {
  const keypair = getAttestorKeypair();
  return Buffer.from(keypair.publicKey).toString("base64");
}

/**
 * Get the attestor private key as Uint8Array
 */
export function getAttestorPrivateKey(): Uint8Array {
  const keypair = getAttestorKeypair();
  return keypair.privateKey;
}
