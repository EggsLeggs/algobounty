import * as nacl from 'tweetnacl';

export interface AttestationPayload {
  githubId: number;
  algorandAddress: string;
  nonce: string;
  expiry: number;
}

export interface Attestation {
  payload: AttestationPayload;
  signature: string; // base64 encoded
  publicKey: string; // base64 encoded
}

/**
 * Create the canonical attestation payload
 * Format: "LINK" || "|" || github_id || "|" || algorand_addr || "|" || expiry_unix || "|" || nonce
 */
export function createAttestationPayload(
  githubId: number,
  algorandAddress: string,
  nonce: string,
  expiryHours: number = 24
): AttestationPayload {
  const expiry = Math.floor(Date.now() / 1000) + expiryHours * 60 * 60;

  return {
    githubId,
    algorandAddress,
    nonce,
    expiry,
  };
}

/**
 * Serialize the attestation payload to bytes
 */
export function serializeAttestationPayload(payload: AttestationPayload): Uint8Array {
  const parts = ["LINK", payload.githubId.toString(), payload.algorandAddress, payload.expiry.toString(), payload.nonce];

  const serialized = parts.join("|");
  return new TextEncoder().encode(serialized);
}

/**
 * Generate a new Ed25519 keypair for attestation
 */
export function generateAttestorKeypair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.secretKey,
  };
}

/**
 * Sign an attestation payload with an Ed25519 private key
 */
export function signAttestation(payload: AttestationPayload, privateKey: Uint8Array): Attestation {
  const serializedPayload = serializeAttestationPayload(payload);
  const signature = nacl.sign.detached(serializedPayload, privateKey);

  // Get the public key from the private key
  const keypair = nacl.sign.keyPair.fromSecretKey(privateKey);

  return {
    payload,
    signature: Buffer.from(signature).toString("base64"),
    publicKey: Buffer.from(keypair.publicKey).toString("base64"),
  };
}

/**
 * Verify an attestation signature
 */
export function verifyAttestation(attestation: Attestation): boolean {
  try {
    const serializedPayload = serializeAttestationPayload(attestation.payload);
    const signature = Buffer.from(attestation.signature, "base64");
    const publicKey = Buffer.from(attestation.publicKey, "base64");

    return nacl.sign.detached.verify(serializedPayload, signature, publicKey);
  } catch (error) {
    console.error("Attestation verification failed:", error);
    return false;
  }
}

/**
 * Check if an attestation has expired
 */
export function isAttestationExpired(attestation: Attestation): boolean {
  const now = Math.floor(Date.now() / 1000);
  return attestation.payload.expiry < now;
}

/**
 * Get the canonical string representation of an attestation payload
 * This is useful for debugging and logging
 */
export function getAttestationPayloadString(payload: AttestationPayload): string {
  return ["LINK", payload.githubId.toString(), payload.algorandAddress, payload.expiry.toString(), payload.nonce].join("|");
}

