'use client';

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, GitBranch, DollarSign, Code, Trophy } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <>
       <motion.header
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.2 }}
         className="mx-auto mb-16 max-w-5xl text-center pt-20"
       >
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-indigo-800 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Low fees, instant finality</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-gradient-to-r from-purple-100 to-fuchsia-100 px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-medium">Trustless escrow</span>
          </span>
        </div>
        <h1 className="mt-4 bg-gradient-to-r from-indigo-900 via-blue-700 to-fuchsia-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
          Trustless Open‑Source Bounties
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-indigo-800 sm:text-base">
          Fund GitHub issues and pay contributors instantly on Algorand.
        </p>
      </motion.header>

      {/* Why AlgoBounty Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-auto mb-20 max-w-6xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">Why AlgoBounty?</h2>
          <p className="text-indigo-700">Built on Algorand for speed, security, and low costs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Escrow Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="group relative h-full"
          >
            <div className="relative rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/20 to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col h-full">
                <h3 className="font-semibold text-indigo-900 mb-2 text-center">Trustless Escrow</h3>
                <p className="text-sm text-indigo-700 text-center flex-grow">USDC (ASA) held securely in smart contracts until work is completed and verified</p>
              </div>
            </div>
          </motion.div>

          {/* Payouts Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="group relative h-full"
          >
            <div className="relative rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-100/20 to-pink-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col h-full">
                <h3 className="font-semibold text-indigo-900 mb-2 text-center">On-chain Payouts</h3>
                <p className="text-sm text-indigo-700 text-center flex-grow">Automatic split payments executed when pull requests are merged and approved</p>
              </div>
            </div>
          </motion.div>

          {/* Speed Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="group relative h-full"
          >
            <div className="relative rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-100/20 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col h-full">
                <h3 className="font-semibold text-indigo-900 mb-2 text-center">Lightning Fast</h3>
                <p className="text-sm text-indigo-700 text-center flex-grow">~4s finality with minimal fees and instant transaction confirmation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

       {/* How It Works Section */}
       <motion.section
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3, delay: 0.4 }}
         className="mx-auto mb-20 max-w-6xl"
       >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">How It Works</h2>
          <p className="text-indigo-700">Simple steps to fund and claim bounties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1: Create GitHub Issue */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.2 }}
             className="text-center"
           >
           <div className="mb-4">
             <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
               <GitBranch className="h-8 w-8 text-blue-600" />
             </div>
           </div>
            <h3 className="font-semibold text-indigo-900 mb-2">Create Issue</h3>
            <p className="text-sm text-indigo-700">Create a GitHub issue describing the work needed</p>
          </motion.div>

          {/* Step 2: Fund with Algo */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.25 }}
             className="text-center"
           >
           <div className="mb-4">
             <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center shadow-lg">
               <DollarSign className="h-8 w-8 text-purple-600" />
             </div>
           </div>
            <h3 className="font-semibold text-indigo-900 mb-2">Fund Issue</h3>
            <p className="text-sm text-indigo-700">Fund the issue with USDC on Algorand blockchain</p>
          </motion.div>

          {/* Step 3: Contribute */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.3 }}
             className="text-center"
           >
           <div className="mb-4">
             <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center shadow-lg">
               <Code className="h-8 w-8 text-green-600" />
             </div>
           </div>
            <h3 className="font-semibold text-indigo-900 mb-2">Contribute</h3>
            <p className="text-sm text-indigo-700">Developers contribute by submitting pull requests</p>
          </motion.div>

          {/* Step 4: Claim Bounty */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.35 }}
             className="text-center"
           >
           <div className="mb-4">
             <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 flex items-center justify-center shadow-lg">
               <Trophy className="h-8 w-8 text-yellow-600" />
             </div>
           </div>
            <h3 className="font-semibold text-indigo-900 mb-2">Claim Bounty</h3>
            <p className="text-sm text-indigo-700">Get paid instantly when your PR is merged</p>
          </motion.div>
        </div>

      </motion.section>
    </>
  );
};

export default HeroSection;
