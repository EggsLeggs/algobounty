'use client';

import React from "react";

// Pearlescent gradient backdrop (subtle blue/purple aesthetic)
export const PearlBackdrop: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(255,255,255,0.9),rgba(255,255,255,0)_60%),
      radial-gradient(50%_50%_at_80%_20%,rgba(147,197,253,0.3),rgba(255,255,255,0)_60%),
      radial-gradient(45%_45%_at_30%_80%,rgba(192,132,252,0.2),rgba(255,255,255,0)_60%),
      radial-gradient(55%_55%_at_90%_75%,rgba(129,140,248,0.2),rgba(255,255,255,0)_60%)] ${className ?? ""}`}
  />
);

// Glass card style: solid white
export const Glass: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={`relative rounded-2xl border border-indigo-200/50 bg-white shadow-xl backdrop-blur-md ${className ?? ""}`}>
    <div className="rounded-2xl p-6">{children}</div>
  </div>
);

// Main layout wrapper with background
export const MainLayout: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 sm:p-10 ${className ?? ""}`}>
    <PearlBackdrop />
    {children}
  </div>
);

// Footer component
export const AppFooter: React.FC = () => (
  <footer className="mx-auto mt-10 max-w-5xl text-center text-xs text-indigo-700">
    <p>
      AlgoBounty • Fund GitHub issues and pay contributors instantly on the Algorand blockchain • Created by Hayden Bradley
    </p>
  </footer>
);
