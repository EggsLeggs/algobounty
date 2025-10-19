'use client';

import React from "react";
import { MainLayout, AppFooter } from "./SharedLayout";
import Navigation from "./Navigation";
import FundIssuePage from "./FundIssuePage";

interface FundPageProps {
  onBountyCreated?: (bountyId: string) => void;
}

export default function FundPage({ onBountyCreated }: FundPageProps) {
  return (
    <MainLayout>
      <Navigation />
      <FundIssuePage onBountyCreated={onBountyCreated} />
    </MainLayout>
  );
}
