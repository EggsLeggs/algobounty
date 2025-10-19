'use client';

import { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';

interface BountyButtonProps {
  issueId: string;
  repository: string;
  currentBounty?: number;
  onBountyCreated?: (bountyId: string) => void;
}

export function BountyButton({
  issueId,
  repository,
  currentBounty = 0,
  onBountyCreated
}: BountyButtonProps) {
  const { activeAddress, wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [bountyAmount, setBountyAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreateBounty = async () => {
    if (!activeAddress) {
      // User needs to connect wallet first
      alert('Please connect your wallet first');
      return;
    }

    if (!bountyAmount || parseFloat(bountyAmount) <= 0) {
      alert('Please enter a valid bounty amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId,
          repository,
          amount: parseFloat(bountyAmount),
          maintainer: activeAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bounty');
      }

      const result = await response.json();
      console.log('Bounty created:', result);

      if (onBountyCreated) {
        onBountyCreated(result.bountyId);
      }

      setShowForm(false);
      setBountyAmount('');
    } catch (error) {
      console.error('Error creating bounty:', error);
      alert('Failed to create bounty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundBounty = async () => {
    if (!activeAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!bountyAmount || parseFloat(bountyAmount) <= 0) {
      alert('Please enter a valid amount to add');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call smart contract to fund existing bounty
      console.log('Funding bounty with amount:', bountyAmount);
      alert('Bounty funding functionality coming soon!');
    } catch (error) {
      console.error('Error funding bounty:', error);
      alert('Failed to fund bounty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentBounty > 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Bounty: {currentBounty} USDC
            </h3>
            <p className="text-sm text-green-600">
              This issue has an active bounty
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Add amount"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(e.target.value)}
              className="px-3 py-1 border border-green-300 rounded text-sm"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleFundBounty}
              disabled={isLoading}
              className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Funds'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {activeAddress ? 'Fund Issue with AlgoBounty' : 'Connect Wallet to Fund Issue'}
        </button>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-800">
            Create Bounty for Issue #{issueId}
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Enter USDC amount"
              value={bountyAmount}
              onChange={(e) => setBountyAmount(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateBounty}
                disabled={isLoading || !bountyAmount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Bounty'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

