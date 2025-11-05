'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, User, Calendar, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glass, MainLayout, AppFooter } from "./SharedLayout";
import { useWallet } from '@txnlab/use-wallet-react';
import { hasBountyLink } from "@/lib/bounty-utils";
import {
  deployBountyContract,
  initializeBountyContract,
  fundBountyContract,
  getBountyInfo,
  BountyContractConfig,
  BountyInfo
} from "@/lib/bounty-contract-algokit";

interface GitHubIssue {
  title: string;
  description: string;
  number: number;
  state: string;
  url: string;
  author: {
    username: string;
    avatar: string;
  };
  repository: {
    fullName: string;
    name: string;
    owner: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BountyData extends BountyInfo {
  bountyId: string;
  contractAddress: string;
  appId: number;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  distributions?: Array<{
    contributor: string;
    amount: number;
    distributedAt: string;
  }>;
}

interface FundIssuePageProps {
  onBountyCreated?: (bountyId: string) => void;
}

export default function FundIssuePage({ onBountyCreated }: FundIssuePageProps) {
  const { activeAddress } = useWallet();
  const [pledge, setPledge] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [issueData, setIssueData] = useState<GitHubIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bountyValidationError, setBountyValidationError] = useState<string | null>(null);
  const [existingBounty, setExistingBounty] = useState<BountyData | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);

  const connected = !!activeAddress;

  // Contract configuration
  const contractConfig: BountyContractConfig = useMemo(() => {
    const algodServer = process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
    const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";
    const algoAssetId = 0; // 0 for native ALGO

    // Validate configuration
    if (!algodToken) {
      console.warn("NEXT_PUBLIC_ALGOD_TOKEN is not set. Using empty token for public node.");
    }

    console.log("Contract config:", { algodServer, algodToken: algodToken ? "***" : "empty", algoAssetId });

    return {
      algodServer,
      algodToken,
      algoAssetId,
    };
  }, []);

  const isValidGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+$/;
    return githubUrlPattern.test(url);
  };

  const fetchExistingBounty = useCallback(async (issueData: GitHubIssue) => {
    try {
      // For now, we'll simulate checking for existing bounties
      // In a real implementation, you would:
      // 1. Query the blockchain for contracts related to this issue
      // 2. Call getBountyInfo for each contract
      // 3. Find the one that matches this issue

      // Mock: Check if we have a stored contract address for this issue
      const issueKey = `${issueData.repository.fullName}#${issueData.number}`;
      const storedContractAddress = localStorage.getItem(`bounty_${issueKey}`);

      if (storedContractAddress) {
        const appId = parseInt(storedContractAddress);
        const result = await getBountyInfo(appId, contractConfig);

        if (result.success && result.data) {
          const bountyData: BountyData = {
            ...result.data,
            bountyId: issueKey,
            contractAddress: storedContractAddress,
            appId: appId,
            status: result.data.isResolved ? "resolved" : "active",
            createdAt: new Date().toISOString(), // Mock date
            totalBounty: result.data.totalBounty / 1000000, // Convert from micro-ALGO to ALGO
          };
          setExistingBounty(bountyData);
        } else {
          setExistingBounty(null);
        }
      } else {
        setExistingBounty(null);
      }
    } catch (err) {
      console.error('Error fetching existing bounty:', err);
      setExistingBounty(null);
    }
  }, [contractConfig]);

  const fetchIssueData = useCallback(async (url: string, overrideRateLimit = false) => {
    setLoading(true);
    setError(null);
    setBountyValidationError(null);
    setExistingBounty(null);
    setRateLimitExceeded(false);
    setShowOverrideWarning(false);

    try {
      const response = await fetch(`/api/github/issue?url=${encodeURIComponent(url)}${overrideRateLimit ? '&overrideRateLimit=true' : ''}`);
      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit with override option
        if (response.status === 403 && data.rateLimitExceeded && data.overrideAvailable) {
          setRateLimitExceeded(true);
          setShowOverrideWarning(true);
          setError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to fetch issue data");
      }

      setIssueData(data);

      // Validate that this is a valid AlgoBounty issue
      // Skip validation if this is a rate limit override (indicated by the warning in the title)
      const isRateLimitOverride = data.title.includes("Rate Limit Override");

      if (!isRateLimitOverride && !hasBountyLink(data.description)) {
        setBountyValidationError("This issue is not eligible for AlgoBounty funding. The issue must contain the AlgoBounty funding link.");
      } else {
        // Fetch existing bounty if issue is valid
        await fetchExistingBounty(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issue data");
      setIssueData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchExistingBounty]);

  // Parse query string for autofill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const issueParam = urlParams.get('issue');

      if (issueParam) {
        // Convert from format: owner/repo/issues/123 to full GitHub URL
        const issueUrl = `https://github.com/${issueParam}`;
        setIssueUrl(issueUrl);
      }
    }
  }, []);

  // Fetch issue data when URL changes
  useEffect(() => {
    if (issueUrl && isValidGitHubUrl(issueUrl)) {
      fetchIssueData(issueUrl);
    } else {
      setIssueData(null);
      setError(null);
      setBountyValidationError(null);
    }
  }, [issueUrl, fetchIssueData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateBounty = async () => {
    if (!connected || !pledge || !issueUrl || !issueData) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      if (existingBounty) {
        // Add to existing bounty
        const amount = Math.floor(parseFloat(pledge) * 1000000); // Convert to micro-ALGO

        // Note: Native ALGO (asset ID 0) does not require opt-in

        // Fund the existing bounty
        const fundResult = await fundBountyContract(existingBounty.appId, {
          contractAddress: existingBounty.contractAddress,
          amount,
          senderPrivateKey: "USER_PRIVATE_KEY" // This would come from the wallet
        }, contractConfig);

        if (!fundResult.success) {
          throw new Error(fundResult.error || "Failed to fund bounty");
        }

        // Update the local state to reflect the new amount
        setExistingBounty({
          ...existingBounty,
          totalBounty: existingBounty.totalBounty + parseFloat(pledge)
        });

        result = { contractAddress: existingBounty.contractAddress, bountyId: existingBounty.bountyId };
      } else {
        // Create new bounty
        const issueId = `${issueData.repository.fullName}#${issueData.number}`;

        // Deploy new contract
        const deployResult = await deployBountyContract({
          issueId,
          maintainer: activeAddress!,
          senderPrivateKey: "USER_PRIVATE_KEY" // This would come from the wallet
        }, contractConfig);

        if (!deployResult.success) {
          throw new Error(deployResult.error || "Failed to deploy contract");
        }

        // Initialize the contract
        const initResult = await initializeBountyContract(
          deployResult.appId!,
          {
            issueId,
            maintainer: activeAddress!,
            senderPrivateKey: "USER_PRIVATE_KEY"
          },
          contractConfig
        );

        if (!initResult.success) {
          throw new Error(initResult.error || "Failed to initialize contract");
        }

        // Note: Native ALGO (asset ID 0) does not require opt-in

        // Fund the new bounty
        const amount = Math.floor(parseFloat(pledge) * 1000000); // Convert to micro-ALGO
        const fundResult = await fundBountyContract(deployResult.appId!, {
          contractAddress: deployResult.contractAddress!,
          amount,
          senderPrivateKey: "USER_PRIVATE_KEY"
        }, contractConfig);

        if (!fundResult.success) {
          throw new Error(fundResult.error || "Failed to fund bounty");
        }

        // Store the app ID for future reference
        const issueKey = `${issueData.repository.fullName}#${issueData.number}`;
        localStorage.setItem(`bounty_${issueKey}`, deployResult.appId!.toString());

        result = {
          contractAddress: deployResult.contractAddress!,
          bountyId: issueKey,
          txId: deployResult.txId
        };
      }

      onBountyCreated?.(result.bountyId);

      // Refresh bounty data to show the updated balance
      if (issueData) {
        await fetchExistingBounty(issueData);
      }

      // Reset form
      setPledge("");

      // Show success message
      const action = existingBounty ? 'added to' : 'created';
      alert(`Bounty ${action} successfully! Contract: ${result.contractAddress}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bounty");
      console.error('Error creating bounty:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Glass>
            <CardHeader className="p-0 text-center">
              <CardTitle className="text-2xl text-indigo-900">Fund Issue</CardTitle>
              <p className="mt-2 text-sm text-indigo-700">
                Create a trustless bounty for any GitHub issue
              </p>
            </CardHeader>

            <CardContent className="mt-6 space-y-6 p-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-indigo-900">GitHub Issue URL</Label>
                  <Input
                    type="url"
                    value={issueUrl}
                    readOnly
                    placeholder="https://github.com/org/repo/issues/123"
                    className="h-11 rounded-xl border-indigo-300/40 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  {showOverrideWarning && rateLimitExceeded && (
                    <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Rate Limit Exceeded
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              GitHub API rate limit has been exceeded. If you confirm that this issue offers an AlgoBounty,
                              you can override this error and proceed with creating a bounty.
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => fetchIssueData(issueUrl, true)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Override & Continue
                            </button>
                            <button
                              onClick={() => {
                                setShowOverrideWarning(false);
                                setRateLimitExceeded(false);
                                setError(null);
                              }}
                              className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {bountyValidationError && (
                    <p className="text-red-500 text-sm mt-1">{bountyValidationError}</p>
                  )}
                </div>

                {/* Issue Details Display */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-indigo-600">Loading issue details and bounty data...</span>
                  </div>
                )}

                {issueData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {issueData.title} #{issueData.number}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-4 w-4" />
                            <span>{issueData.repository.fullName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{issueData.author.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(issueData.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={issueData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issueData.state === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {issueData.state}
                      </span>
                      {hasBountyLink(issueData.description) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          AlgoBounty Eligible
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Bounty Balance Display */}
                {existingBounty && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-green-200 rounded-xl p-4 bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800 text-lg">
                          Current Bounty Balance
                        </h4>
                        <p className="text-green-600 text-sm">
                          Contract: {existingBounty.contractAddress}
                        </p>
                        <p className="text-green-600 text-sm">
                          Status: {existingBounty.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-800">
                          {existingBounty.totalBounty} ALGO
                        </div>
                        <div className="text-sm text-green-600">
                          Created: {formatDate(existingBounty.createdAt)}
                        </div>
                        {existingBounty.distributions && existingBounty.distributions.length > 0 && (
                          <div className="text-sm text-green-600">
                            Distributions: {existingBounty.distributions.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label className="text-indigo-900">
                    {existingBounty ? 'Add to Bounty (ALGO)' : 'Pledge Amount (ALGO)'}
                  </Label>
                  <Input
                    type="number"
                    value={pledge}
                    onChange={(e) => setPledge(e.target.value)}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="h-11 rounded-xl border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { k: "Escrow", v: "ALGO (Native)" },
                    { k: "Payouts", v: "On-chain split" },
                    { k: "Speed", v: "~4s finality" },
                  ].map((stat) => (
                    <div key={stat.k} className="rounded-xl border border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 p-3 text-center text-sm text-indigo-900">
                      <div className="text-xs uppercase tracking-wide text-indigo-500">{stat.k}</div>
                      <div className="mt-1 font-semibold text-indigo-900">{stat.v}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-indigo-800">
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300/40 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Low fees, instant finality
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300/40 bg-gradient-to-r from-purple-100 to-fuchsia-100 px-2 py-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> Trustless escrow
                  </span>
                </div>
              </div>

              <Button
                disabled={!connected || !pledge || !issueUrl || !issueData || !!bountyValidationError || loading}
                onClick={handleCreateBounty}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-5 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {existingBounty ? 'Adding to Bounty...' : 'Creating Bounty...'}
                  </>
                ) : (
                  <>
                    {existingBounty ? 'Add to Bounty' : 'Create Bounty'}
                    <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>

              {!connected && (
                <p className="text-center text-xs text-indigo-600">
                  Connect your wallet to create a bounty
                </p>
              )}
            </CardContent>
          </Glass>
        </motion.div>
      </div>

      <AppFooter />
    </MainLayout>
  );
}
