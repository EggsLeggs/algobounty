'use client';

import { AlgoBountyWalletProvider } from '@/components/WalletProvider';
import FundPage from '@/components/FundPage';
import { useState, useEffect } from 'react';

function FundPageApp() {
  const [bounties, setBounties] = useState<Array<{ bountyId: string; issueId: string; repository: string; amount: number; status: string; createdAt: string }>>([]);

  useEffect(() => {
    // Load existing bounties
    fetchBounties();
  }, []);

  const fetchBounties = async () => {
    try {
      const response = await fetch('/api/bounties');
      if (response.ok) {
        const data = await response.json();
        setBounties(data);
      }
    } catch (error) {
      console.error('Error fetching bounties:', error);
    }
  };

  const handleBountyCreated = (bountyId: string) => {
    console.log('Bounty created:', bountyId);
    fetchBounties(); // Refresh the list
  };

  return (
    <FundPage onBountyCreated={handleBountyCreated} />
  );
}

export default function Fund() {
  return (
    <AlgoBountyWalletProvider>
      <FundPageApp />
    </AlgoBountyWalletProvider>
  );
}
