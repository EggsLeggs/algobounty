'use client';

import React from "react";
import { Github, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Glass component matching the existing design
const Glass: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={`relative rounded-2xl border border-indigo-200/50 bg-white shadow-xl backdrop-blur-md ${className ?? ""}`}>
    <div className="rounded-2xl p-6">{children}</div>
  </div>
);

interface GitHubAppCardProps {
  className?: string;
}

export default function GitHubAppCard({ className }: GitHubAppCardProps) {
  const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || "#";

  const handleInstall = () => {
    if (installUrl !== "#") {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Glass className={className}>
      <CardHeader className="p-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
            <Github className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-indigo-900">GitHub App</CardTitle>
            <p className="text-sm text-indigo-600">Auto-add bounty links to issues</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-4 p-0">
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-300/40 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-indigo-900">Automatic Bounty Links</h4>
                <p className="text-sm text-indigo-700">
                  When you create a new issue, our GitHub App automatically adds a funding link at the top of the description.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleInstall}
            className="w-full h-11 items-center gap-2 rounded-xl border border-indigo-400 bg-indigo-600 px-4 font-medium text-white shadow-md transition hover:bg-indigo-700"
          >
            <Github className="h-4 w-4" />
            Install GitHub App
            <ExternalLink className="h-4 w-4" />
          </Button>

          <div className="text-xs text-indigo-600 text-center">
            Install on your repositories to enable automatic bounty link generation
          </div>
        </div>
      </CardContent>
    </Glass>
  );
}
