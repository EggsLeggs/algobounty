import * as algosdk from "algosdk";

export interface GitHubUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

export interface LinkSession {
  githubUser: GitHubUser;
  nonce?: string;
  algorandAddress?: string;
  isLinked: boolean;
}

/**
 * Initiate GitHub OAuth flow
 */
export async function initiateGitHubOAuth(): Promise<string> {
  const response = await fetch("/api/auth/github", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to initiate GitHub OAuth");
  }

  const data = await response.json();
  return data.authUrl;
}

/**
 * Generate a nonce for wallet signing
 */
export async function generateNonce(githubId: number, algorandAddress: string): Promise<string> {
  const response = await fetch("/api/auth/link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      githubId,
      algorandAddress,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate nonce");
  }

  const data = await response.json();
  return data.nonce;
}

/**
 * Verify a nonce
 */
export async function verifyNonce(nonce: string): Promise<{ valid: boolean; githubId?: number }> {
  const response = await fetch(`/api/auth/link?nonce=${nonce}`, {
    method: "GET",
  });

  if (!response.ok) {
    return { valid: false };
  }

  const data = await response.json();
  return {
    valid: data.valid,
    githubId: data.githubId,
  };
}

/**
 * Sign a nonce with the user's Algorand wallet
 * This function handles the actual wallet signing process
 */
export async function signNonceWithWallet(
  nonce: string,
  address: string,
  signer: (message: Uint8Array) => Promise<Uint8Array>
): Promise<{ signature: Uint8Array; address: string }> {
  // Convert hex nonce to bytes
  const nonceBytes = new Uint8Array(Buffer.from(nonce, "hex"));

  // Sign the nonce
  const signature = await signer(nonceBytes);

  return {
    signature,
    address,
  };
}

/**
 * Send signature to backend for verification and linking
 */
export async function submitSignatureForLinking(
  nonce: string,
  signature: Uint8Array,
  algorandAddress: string,
  githubId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nonce,
        signature: Array.from(signature), // Convert Uint8Array to regular array for JSON
        algorandAddress,
        githubId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Verification failed" };
    }

    await response.json();
    return { success: true };
  } catch (error) {
    console.error("Failed to submit signature:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Verify a signature against a nonce and address (client-side verification)
 */
export function verifySignature(nonce: string, signature: Uint8Array, address: string): boolean {
  try {
    // Convert hex nonce to bytes
    const nonceBytes = new Uint8Array(Buffer.from(nonce, "hex"));

    // Verify the signature
    return algosdk.verifyBytes(nonceBytes, signature, address);
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Parse GitHub user data from URL parameters
 */
export function parseGitHubUserFromUrl(): GitHubUser | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);

  const githubLinked = urlParams.get("github_linked");
  if (githubLinked !== "true") return null;

  const id = urlParams.get("github_id");
  const username = urlParams.get("github_username");
  const name = urlParams.get("github_name");
  const avatar = urlParams.get("github_avatar");

  if (!id || !username) return null;

  return {
    id: parseInt(id),
    username,
    name: name || "",
    email: "", // Email not provided in URL params for security
    avatar_url: avatar || "",
    html_url: `https://github.com/${username}`,
  };
}

/**
 * Clear GitHub OAuth parameters from URL
 */
export function clearGitHubOAuthParams(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const paramsToRemove = ["github_linked", "github_id", "github_username", "github_name", "github_avatar", "error"];

  paramsToRemove.forEach((param) => {
    url.searchParams.delete(param);
  });

  // Update URL without page reload
  window.history.replaceState({}, "", url.toString());
}
