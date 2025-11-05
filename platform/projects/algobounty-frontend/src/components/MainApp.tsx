'use client';

import React from "react";
import { MainLayout, AppFooter } from "./SharedLayout";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import GetStartedCard from "./GetStartedCard";
import GitHubAppCard from './GitHubAppCard';

interface MainAppProps {
  onBountyCreated?: (bountyId: string) => void;
}

export default function MainApp({}: MainAppProps) {
  return (
    <MainLayout>
      <Navigation />
      <HeroSection />

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <section className="space-y-6">
          <GitHubAppCard />
        </section>

        <section className="space-y-6">
          <GetStartedCard />
        </section>
      </main>

      <AppFooter />
    </MainLayout>
  );
}
