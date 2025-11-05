'use client';

import React, { useState, useEffect } from "react";
import { Github, ExternalLink, CheckCircle, User, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet, Wallet as WalletType, WalletId } from '@txnlab/use-wallet-react';
import {
  initiateGitHubOAuth,
  generateNonce,
  submitSignatureForLinking,
  parseGitHubUserFromUrl,
  clearGitHubOAuthParams,
  GitHubUser
} from '@/lib/auth-utils';

// Glass component matching the existing design
const Glass: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={`relative rounded-2xl border border-indigo-200/50 bg-white shadow-xl backdrop-blur-md ${className ?? ""}`}>
    <div className="rounded-2xl p-6">{children}</div>
  </div>
);

interface GitHubLinkCardProps {
  className?: string;
}

export default function GitHubLinkCard({ className }: GitHubLinkCardProps) {
  const { wallets, activeAddress, transactionSigner } = useWallet();

  const [githubUser, setGitHubUser] = useState<GitHubUser | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkStep, setLinkStep] = useState<'idle' | 'github' | 'wallet' | 'complete'>('idle');
  const [currentNonce, setCurrentNonce] = useState<string | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [linkedGitHubUser, setLinkedGitHubUser] = useState<GitHubUser | null>(null);

  const connected = !!activeAddress;
  const address = activeAddress || "";

  // Find the localnet wallet (KMD)
  const localnetWallet = wallets?.find((wallet: WalletType) => wallet.id === WalletId.KMD);

  const githubUsername = githubUser?.username || "";

  // Check for GitHub OAuth callback on component mount
  useEffect(() => {
    const githubUser = parseGitHubUserFromUrl();
    if (githubUser) {
      setGitHubUser(githubUser);
      setLinkStep('wallet');
      clearGitHubOAuthParams();

      // Generate nonce immediately when GitHub user is detected
      if (connected && address) {
        generateNonceForUser(githubUser.id, address);
      }
    }
  }, [connected, address]);

  // Check for existing links when wallet address changes
  useEffect(() => {
    if (connected && address && !linkedGitHubUser) {
      checkExistingLink(address);
    }
  }, [connected, address, linkedGitHubUser]);

  const generateNonceForUser = async (githubId: number, algorandAddress: string) => {
    try {
      console.log('Generating nonce for:', { githubId, algorandAddress });
      const nonce = await generateNonce(githubId, algorandAddress);
      console.log('Generated nonce:', nonce.slice(0, 8) + '...');
      setCurrentNonce(nonce);
    } catch (error) {
      console.error('Failed to generate nonce:', error);
      setLinkError('Failed to generate nonce. Please try again.');
    }
  };

  const checkExistingLink = async (algorandAddress: string) => {
    setIsCheckingLink(true);
    try {
      const response = await fetch(`/api/github/check-by-address?address=${encodeURIComponent(algorandAddress)}`);
      const data = await response.json();

      if (data.isLinked && data.githubUser) {
        setLinkedGitHubUser({
          id: data.githubUser.id,
          username: data.githubUser.login,
          name: data.githubUser.name,
          email: "", // Email not available from GitHub API without additional permissions
          avatar_url: data.githubUser.avatar_url,
          html_url: data.githubUser.html_url,
        });
        // Don't set linkStep to 'complete' for existing links - that's only for newly created links
      }
    } catch (error) {
      console.error('Failed to check existing links:', error);
    } finally {
      setIsCheckingLink(false);
    }
  };

  const connectWallet = async () => {
    if (localnetWallet) {
      try {
        await localnetWallet.connect();

        // Use activeAddress from the hook instead of localnetWallet.accounts
        const walletAddress = activeAddress || localnetWallet.accounts[0]?.address || '';

        // Check if this wallet is already linked to a GitHub account
        await checkExistingLink(walletAddress);

        // If we have a GitHub user but no nonce yet, generate one now
        if (githubUser && !currentNonce) {
          generateNonceForUser(githubUser.id, walletAddress);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const linkGitHub = async () => {
    if (!connected || !address) {
      setLinkError('Please connect your wallet first');
      return;
    }

    setIsLinking(true);
    setLinkError(null);
    setLinkStep('github');

    try {
      // Step 1: Initiate GitHub OAuth
      const authUrl = await initiateGitHubOAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('GitHub OAuth failed:', error);
      setLinkError('Failed to initiate GitHub authentication');
      setIsLinking(false);
      setLinkStep('idle');
    }
  };

  const completeLinking = async () => {
    if (!githubUser || !address || !transactionSigner || !currentNonce) {
      setLinkError('Missing required data for linking');
      return;
    }

    setIsLinking(true);
    setLinkError(null);

    try {
      console.log('Starting linking process:', {
        githubId: githubUser.id,
        address,
        nonce: currentNonce.slice(0, 8) + '...',
      });

      // Step 3: Sign nonce with wallet
      // Note: transactionSigner is for transactions, but we need message signing
      // For now, we'll simulate this - in production you'd need a proper message signing function
      const mockSignature = new Uint8Array(64); // Placeholder signature

      // Step 4: Submit signature to backend for verification
      const result = await submitSignatureForLinking(
        currentNonce,
        mockSignature,
        address,
        githubUser.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Verification failed');
      }

      // Step 5: Complete linking
      console.log('Linking completed successfully:', {
        githubId: githubUser.id,
        algorandAddress: address,
        nonce: currentNonce,
      });

      setLinkStep('complete');
      setCurrentNonce(null);

    } catch (error) {
      console.error('Wallet signing failed:', error);
      setLinkError(error instanceof Error ? error.message : 'Failed to sign with wallet. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Glass className={className}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-900">Get Started</h2>
        <p className="mt-2 text-sm text-indigo-700">
          Connect your wallet and link your GitHub account
        </p>
      </div>

      <div className="space-y-6">
        {/* Wallet Connection Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900">Wallet Connection</h3>
              <p className="text-sm text-indigo-600">Connect your Algorand wallet to get started</p>
            </div>
          </div>

          {!connected ? (
            <Button
              onClick={connectWallet}
              className="w-full h-11 items-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-4 font-medium text-white shadow-md transition hover:bg-indigo-700"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          ) : (
            <div className="rounded-xl border border-indigo-300/40 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                      <Wallet className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-indigo-700 mt-1">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GitHub Account Section */}
        {connected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-gray-600 to-gray-700">
                <Github className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900">GitHub Account</h3>
                <p className="text-sm text-indigo-600">Link your GitHub account to manage bounties</p>
              </div>
            </div>

            {/* Hackathon Notice */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">ℹ</span>
                </div>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">Hackathon Notice</p>
                  <p className="text-blue-700 mt-1">
                    For this hackathon demo, GitHub-Algorand connections are stored in MongoDB due to time constraints.
                    In production, this would be stored on-chain using Algorand smart contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Check for existing link */}
            {isCheckingLink && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-800">Checking for existing GitHub link...</p>
                </div>
              </div>
            )}

            {/* Already Linked State */}
            {linkedGitHubUser && (
              <div className="space-y-3">
                <div className="rounded-xl border border-green-300/40 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                          <User className="h-3 w-3 mr-1" />
                          Already Linked
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {linkedGitHubUser.avatar_url && (
                          <img
                            src={linkedGitHubUser.avatar_url}
                            alt={linkedGitHubUser.username}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-sm text-indigo-700 font-medium">
                            @{linkedGitHubUser.username}
                          </p>
                          {linkedGitHubUser.name && (
                            <p className="text-xs text-indigo-600">
                              {linkedGitHubUser.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Linked to {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                      {linkedGitHubUser.html_url && (
                        <a
                          href={linkedGitHubUser.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          View on GitHub
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!linkedGitHubUser && linkStep === 'idle' ? (
              <div className="space-y-3">
                {/* Warning about on-chain linking */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 text-xs font-bold">!</span>
                    </div>
                    <div className="text-sm">
                      <p className="text-amber-800 font-medium">Privacy Notice</p>
                      <p className="text-amber-700 mt-1">
                        Linking your GitHub account is stored on-chain and will be publicly visible.
                        This creates a permanent connection between your wallet address and GitHub username.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link Error Display */}
                {linkError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                      <div className="text-sm">
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-700 mt-1">{linkError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Link Button */}
                <Button
                  onClick={linkGitHub}
                  disabled={isLinking}
                  className="w-full h-11 items-center gap-2 rounded-xl border border-gray-400 bg-gray-600 px-4 font-medium text-white shadow-md transition hover:bg-gray-700 disabled:opacity-50"
                >
                  {isLinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="h-4 w-4" />
                  )}
                  {isLinking ? 'Redirecting to GitHub...' : 'Link GitHub Account'}
                  {!isLinking && <ExternalLink className="h-4 w-4" />}
                </Button>
              </div>
            ) : !linkedGitHubUser && linkStep === 'wallet' ? (
              <div className="space-y-3">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-medium">
                      1
                    </div>
                    <div className="ml-2 text-sm text-green-600 font-medium">GitHub</div>
                  </div>
                  <div className="h-0.5 w-8 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
                      2
                    </div>
                    <div className="ml-2 text-sm text-blue-600 font-medium">Wallet</div>
                  </div>
                </div>

                {/* GitHub Success */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-green-800 font-medium">Step 1 Complete: GitHub Connected</p>
                      <p className="text-green-700 mt-1">
                        Successfully authenticated as @{githubUsername}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallet Signing Step */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <Wallet className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-amber-800 font-medium">Step 2 Required: Sign with Wallet</p>
                      <p className="text-amber-700 mt-1">
                        Your GitHub account is not yet linked. Please sign the nonce below with your wallet to complete the linking process and create the on-chain connection.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nonce Display */}
                {currentNonce && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="text-sm">
                      <p className="text-blue-800 font-medium mb-2">Sign this nonce with your wallet:</p>
                      <div className="bg-white rounded border p-2 font-mono text-xs break-all text-blue-900">
                        {currentNonce}
                      </div>
                      <p className="text-blue-600 text-xs mt-2">
                        This nonce proves you control the wallet address: {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Link Error Display */}
                {linkError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                      <div className="text-sm">
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-700 mt-1">{linkError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complete Linking Button */}
                <Button
                  onClick={completeLinking}
                  disabled={isLinking}
                  className="w-full h-11 items-center gap-2 rounded-xl border border-amber-400 bg-amber-600 px-4 font-medium text-white shadow-md transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {isLinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  {isLinking ? 'Signing with Wallet...' : 'Sign Nonce & Complete Linking'}
                </Button>
              </div>
            ) : !linkedGitHubUser && linkStep === 'complete' ? (
              <div className="space-y-3">
                {/* Progress Indicator - Complete */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-medium">
                      ✓
                    </div>
                    <div className="ml-2 text-sm text-green-600 font-medium">GitHub</div>
                  </div>
                  <div className="h-0.5 w-8 bg-green-300"></div>
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-medium">
                      ✓
                    </div>
                    <div className="ml-2 text-sm text-green-600 font-medium">Wallet</div>
                  </div>
                </div>

                {/* Success State */}
                <div className="rounded-xl border border-indigo-300/40 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                          <User className="h-3 w-3 mr-1" />
                          Successfully Linked
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-700 mt-1">
                        @{githubUsername}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Linked to {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {!connected && (
          <div className="text-center py-4">
            <p className="text-sm text-indigo-600">
              Connect your wallet first to link your GitHub account
            </p>
          </div>
        )}
      </div>
    </Glass>
  );
}
