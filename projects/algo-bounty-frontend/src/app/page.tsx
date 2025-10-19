'use client';

import { AlgoBountyWalletProvider } from '@/components/WalletProvider';
import MainApp from '@/components/MainApp';
import { useState, useEffect } from 'react';

function AlgoBountyApp() {
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
    <MainApp onBountyCreated={handleBountyCreated} />
  );
}

export default function Home() {
  return (
    <AlgoBountyWalletProvider>
      <AlgoBountyApp />
    </AlgoBountyWalletProvider>
  );
}
