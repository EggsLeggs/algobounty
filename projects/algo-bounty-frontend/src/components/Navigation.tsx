'use client';

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Copy, LogOut, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet, Wallet as WalletType, WalletId } from '@txnlab/use-wallet-react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  const { wallets, activeAddress } = useWallet();

  const connected = !!activeAddress;
  const address = activeAddress || "";

  // Find the localnet wallet (KMD)
  const localnetWallet = wallets?.find((wallet: WalletType) => wallet.id === WalletId.KMD);

  const copyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
    }
  };

  const connectWallet = async () => {
    if (localnetWallet) {
      try {
        await localnetWallet.connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const disconnect = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
      } else {
        // Required for logout/cleanup of inactive providers
        localStorage.removeItem('@txnlab/use-wallet:v3');
        window.location.reload();
      }
    }
  };

  const addToGitHub = () => {
    // Get GitHub app installation URL from environment variables
    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;

    if (installUrl && installUrl !== "#") {
      // Open GitHub app installation page in new tab
      window.open(installUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: show alert if URL is not configured
      alert('GitHub app installation URL is not configured. Please check your environment variables.');
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="flex items-center rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-xl w-7xl">
        {/* Left: GitHub App Button */}
        <div className="flex items-center flex-1">
          <Button
            onClick={addToGitHub}
            variant="ghost"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 px-3 font-medium text-indigo-900 shadow-sm transition hover:bg-indigo-100"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Add to GitHub</span>
          </Button>
        </div>

        {/* Center: Branding */}
        <Link href="/" className="flex items-center justify-center gap-2 flex-1 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AB</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-900 via-blue-700 to-fuchsia-600 bg-clip-text text-transparent">
            AlgoBounty
          </span>
        </Link>

        {/* Right: Wallet Connection */}
        <div className="flex items-center justify-end gap-2 flex-1">
          {!connected ? (
            <Button
              onClick={connectWallet}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-3 font-medium text-white shadow-md transition hover:bg-indigo-700"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                <Wallet className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="text-xs text-indigo-700 hover:text-indigo-900"
              >
                <Copy className="h-3 w-3 mr-1" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
