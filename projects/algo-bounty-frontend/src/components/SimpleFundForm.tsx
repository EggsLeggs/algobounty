'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, User, Calendar, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface SimpleFundFormProps {
  onNavigateToFund: () => void;
  initialIssueUrl?: string;
}

const SimpleFundForm: React.FC<SimpleFundFormProps> = ({ onNavigateToFund, initialIssueUrl }) => {
  const [issueUrl, setIssueUrl] = useState(initialIssueUrl || "");
  const [issueData, setIssueData] = useState<GitHubIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState("");

  // Fetch issue data when URL changes
  useEffect(() => {
    if (issueUrl && isValidGitHubUrl(issueUrl)) {
      fetchIssueData(issueUrl);
    } else {
      setIssueData(null);
      setError(null);
    }
  }, [issueUrl]);

  const isValidGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+$/;
    return githubUrlPattern.test(url);
  };

  const fetchIssueData = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/github/issue?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issue data");
      }

      setIssueData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issue data");
      setIssueData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueUrl(e.target.value);
  };

  const handlePledgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPledgeAmount(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="relative rounded-2xl border border-indigo-200/50 bg-white shadow-xl backdrop-blur-md">
          <div className="rounded-2xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">Fund Issue</h2>
              <p className="mt-2 text-sm text-indigo-700">
                Create a trustless bounty for any GitHub issue
              </p>
            </div>

            <div className="space-y-6">
              {/* GitHub Issue URL Input */}
              <div className="space-y-2">
                <label className="text-indigo-900 text-sm font-medium">GitHub Issue URL</label>
                <input
                  type="url"
                  value={issueUrl}
                  onChange={handleUrlChange}
                  placeholder="https://github.com/org/repo/issues/123"
                  className="w-full h-11 rounded-xl border border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 placeholder:text-indigo-400 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
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
                        {issueData.title}
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

                  {issueData.description && (
                    <div className="mt-3">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {truncateText(issueData.description, 200)}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issueData.state === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {issueData.state}
                    </span>
                    <span className="text-xs text-gray-500">
                      Issue #{issueData.number}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Pledge Amount Input */}
              <div className="space-y-2">
                <label className="text-indigo-900 text-sm font-medium">Pledge Amount (USDC)</label>
                <input
                  type="number"
                  value={pledgeAmount}
                  onChange={handlePledgeChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className="w-full h-11 rounded-xl border border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 placeholder:text-indigo-400 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              onClick={onNavigateToFund}
              disabled={!issueData || !pledgeAmount || parseFloat(pledgeAmount) <= 0}
              className="w-full mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-5 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Bounty
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleFundForm;
