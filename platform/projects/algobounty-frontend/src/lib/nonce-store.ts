/**
 * MongoDB-based nonce store for the authentication system
 * In development, this uses MongoDB for persistent storage
 */

import {
  storeNonce as mongoStoreNonce,
  getNonce as mongoGetNonce,
  deleteNonce as mongoDeleteNonce,
  cleanupExpiredNonces as mongoCleanupExpiredNonces,
} from "./mongodb";

export interface NonceData {
  nonce: string;
  expires: number;
  githubId?: number;
}

/**
 * Store a nonce with expiration and associated data
 */
export async function storeNonce(nonce: string, githubId: number, expiresInMinutes: number = 10): Promise<void> {
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await mongoStoreNonce({
    nonce,
    github_id: githubId,
    algorand_address: "", // Will be set when the nonce is used
    expires,
  });

  console.log("Stored nonce in MongoDB:", { nonce: nonce.slice(0, 8) + "...", githubId, expires: expires.toISOString() });
}

/**
 * Retrieve and validate a nonce
 */
export async function getNonce(nonce: string): Promise<NonceData | null> {
  const nonceData = await mongoGetNonce(nonce);

  console.log("Looking up nonce in MongoDB:", { nonce: nonce.slice(0, 8) + "...", found: !!nonceData });

  if (!nonceData) {
    console.log("Nonce not found in MongoDB");
    return null;
  }

  if (nonceData.expires < new Date()) {
    console.log("Nonce expired:", { nonce: nonce.slice(0, 8) + "...", expires: nonceData.expires.toISOString() });
    await mongoDeleteNonce(nonce);
    return null;
  }

  console.log("Nonce found and valid:", { nonce: nonce.slice(0, 8) + "...", githubId: nonceData.github_id });

  return {
    nonce: nonceData.nonce,
    expires: nonceData.expires.getTime(),
    githubId: nonceData.github_id,
  };
}

/**
 * Delete a nonce (mark as used)
 */
export async function deleteNonce(nonce: string): Promise<void> {
  await mongoDeleteNonce(nonce);
  console.log("Deleted nonce from MongoDB:", nonce.slice(0, 8) + "...");
}

/**
 * Check if a nonce exists and is valid
 */
export async function isValidNonce(nonce: string): Promise<boolean> {
  const nonceData = await getNonce(nonce);
  return nonceData !== null;
}

/**
 * Clean up expired nonces
 */
export async function cleanupExpiredNonces(): Promise<void> {
  const deletedCount = await mongoCleanupExpiredNonces();
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired nonces from MongoDB`);
  }
}

/**
 * Get all nonces (for debugging) - not implemented for MongoDB
 */
export function getAllNonces(): NonceData[] {
  console.warn("getAllNonces not implemented for MongoDB");
  return [];
}
