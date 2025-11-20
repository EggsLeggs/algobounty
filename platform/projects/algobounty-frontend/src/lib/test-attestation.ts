import { createAttestationPayload, signAttestation, verifyAttestation, getAttestationPayloadString } from "./attestation";
import { generateAttestorKeypair } from "./attestation";

/**
 * Test function to verify the attestation system works correctly
 */
export function testAttestationSystem() {
  console.log("Testing attestation system...");

  // Generate a test keypair
  const keypair = generateAttestorKeypair();

  // Create a test payload
  const payload = createAttestationPayload(
    12345, // GitHub ID
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890123456789012345678901234567890", // Algorand address
    "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", // Nonce
    24 // 24 hours
  );

  console.log("Test payload:", getAttestationPayloadString(payload));

  // Sign the attestation
  const attestation = signAttestation(payload, keypair.privateKey);

  console.log("Attestation created:", {
    payload: attestation.payload,
    signature: attestation.signature,
    publicKey: attestation.publicKey,
  });

  // Verify the attestation
  const isValid = verifyAttestation(attestation);

  console.log("Attestation verification result:", isValid);

  if (isValid) {
    console.log("✅ Attestation system test passed!");
  } else {
    console.log("❌ Attestation system test failed!");
  }

  return isValid;
}

// Export for use in development
if (typeof window === "undefined") {
  // Only run in Node.js environment
  testAttestationSystem();
}
