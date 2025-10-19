'use client';

import React from "react";
import { Github, ExternalLink, CheckCircle, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet, Wallet as WalletType, WalletId } from '@txnlab/use-wallet-react';

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
  const { wallets, activeAddress } = useWallet();

  const connected = !!activeAddress;
  const address = activeAddress || "";

  // Find the localnet wallet (KMD)
  const localnetWallet = wallets?.find((wallet: WalletType) => wallet.id === WalletId.KMD);

  // For now, we'll assume GitHub is not linked (logic coming soon)
  const isGitHubLinked = false;
  const githubUsername = "username"; // This will come from the backend later

  const connectWallet = async () => {
    if (localnetWallet) {
      try {
        await localnetWallet.connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const linkGitHub = () => {
    // TODO: Implement GitHub linking logic
    console.log('Link GitHub account');
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

            {!isGitHubLinked ? (
              <Button
                onClick={linkGitHub}
                className="w-full h-11 items-center gap-2 rounded-xl border border-gray-400 bg-gray-600 px-4 font-medium text-white shadow-md transition hover:bg-gray-700"
              >
                <Github className="h-4 w-4" />
                Link GitHub Account
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : (
              <div className="rounded-xl border border-indigo-300/40 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                        <User className="h-3 w-3 mr-1" />
                        Linked
                      </Badge>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1">
                      @{githubUsername}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
