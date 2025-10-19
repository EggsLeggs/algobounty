'use client';

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GetStartedCardProps {
  onNavigateToFund: () => void;
}

const GetStartedCard: React.FC<GetStartedCardProps> = ({ onNavigateToFund }) => {
  return (
    <div className="relative rounded-2xl border border-indigo-200/50 bg-white shadow-xl backdrop-blur-md">
      <div className="rounded-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">Get Started</h2>
          <p className="mt-2 text-sm text-indigo-700">
            Connect your wallet and start funding issues
          </p>
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
          onClick={onNavigateToFund}
          className="w-full mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-5 font-semibold text-white shadow-lg transition hover:bg-indigo-700"
        >
          Fund an Issue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GetStartedCard;
