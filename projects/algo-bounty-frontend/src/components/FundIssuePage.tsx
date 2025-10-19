'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, User, Calendar, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Glass, MainLayout, AppFooter } from "./SharedLayout";
import { useWallet } from '@txnlab/use-wallet-react';
import { hasBountyLink } from "@/lib/bounty-utils";

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

  const connected = !!activeAddress;

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
  }, [issueUrl]);

  const isValidGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+$/;
    return githubUrlPattern.test(url);
  };

  const fetchIssueData = async (url: string) => {
    setLoading(true);
    setError(null);
    setBountyValidationError(null);

    try {
      const response = await fetch(`/api/github/issue?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issue data");
      }

      setIssueData(data);

      // Validate that this is a valid AlgoBounty issue
      if (!hasBountyLink(data.description)) {
        setBountyValidationError("This issue is not eligible for AlgoBounty funding. The issue must contain the AlgoBounty funding link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issue data");
      setIssueData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreateBounty = () => {
    if (!connected || !pledge || !issueUrl || !issueData) return;

    // Here you would integrate with your actual bounty creation logic
    console.log('Creating bounty:', { issueUrl, pledge, issueData });

    // Mock bounty creation
    const bountyId = `bounty-${Date.now()}`;
    onBountyCreated?.(bountyId);

    // Reset form
    setPledge("");
    setIssueUrl("");
    setIssueData(null);
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
                  {bountyValidationError && (
                    <p className="text-red-500 text-sm mt-1">{bountyValidationError}</p>
                  )}
                </div>

                {/* Issue Details Display */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-indigo-600">Loading issue details...</span>
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

                <div className="space-y-2">
                  <Label className="text-indigo-900">Pledge Amount (USDC)</Label>
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
                    { k: "Escrow", v: "USDC (ASA)" },
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
                disabled={!connected || !pledge || !issueUrl || !issueData || !!bountyValidationError}
                onClick={handleCreateBounty}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-5 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Bounty
                <ChevronDown className="h-4 w-4 -rotate-90 transition-transform group-hover:translate-x-0.5" />
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
