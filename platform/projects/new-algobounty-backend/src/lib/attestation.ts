import * as nacl from "tweetnacl";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const PAYLOAD_PREFIX = "ALGOBOUNTY_ATTESTATION";

export interface AttestationPayload {
  githubId: string;
  algorandAddress: string;
  nonce: string;
  expiry: number;
}

export interface Attestation {
  payload: AttestationPayload;
  signature: string;
  publicKey: string;
}

/**
 * Create an attestation payload with a future expiry timestamp.
 */
export function createAttestationPayload(
  githubId: string | number,
  algorandAddress: string,
  nonce: string,
  expiryHours = 24,
): AttestationPayload {
  if (!githubId || !algorandAddress || !nonce) {
    throw new Error("githubId, algorandAddress and nonce are required");
  }

  if (expiryHours <= 0) {
    throw new Error("expiryHours must be greater than 0");
  }

  const expiry = Date.now() + expiryHours * MILLISECONDS_PER_HOUR;

  return {
    githubId: githubId.toString(),
    algorandAddress,
    nonce,
    expiry,
  };
}

/**
 * Sign the attestation payload using the attestor's Ed25519 private key.
 */
export function signAttestation(payload: AttestationPayload, privateKey: Uint8Array | Buffer): Attestation {
  if (!privateKey || privateKey.length !== 64) {
    throw new Error("Invalid private key provided. Expected 64-byte Ed25519 secret key");
  }

  const keyPair = nacl.sign.keyPair.fromSecretKey(new Uint8Array(privateKey));
  const payloadBytes = serializePayload(payload);
  const signature = nacl.sign.detached(payloadBytes, keyPair.secretKey);

  return {
    payload,
    signature: Buffer.from(signature).toString("base64"),
    publicKey: Buffer.from(keyPair.publicKey).toString("base64"),
  };
}

/**
 * Verify an attestation signature.
 */
export function verifyAttestation(attestation: Attestation): boolean {
  const { payload, signature, publicKey } = attestation;

  try {
    const payloadBytes = serializePayload(payload);
    const signatureBytes = Buffer.from(signature, "base64");
    const publicKeyBytes = Buffer.from(publicKey, "base64");

    return nacl.sign.detached.verify(payloadBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error("Failed to verify attestation:", error);
    return false;
  }
}

/**
 * Returns true if the attestation payload is expired.
 */
export function isAttestationExpired(attestation: Attestation): boolean {
  return attestation.payload.expiry <= Date.now();
}

/**
 * Serialize the payload into a canonical UTF-8 byte array for signing.
 */
function serializePayload(payload: AttestationPayload): Uint8Array {
  const canonicalString = [
    PAYLOAD_PREFIX,
    payload.githubId,
    payload.algorandAddress,
    payload.nonce,
    payload.expiry.toString(),
  ].join("|");

  return Buffer.from(canonicalString, "utf8");
}

