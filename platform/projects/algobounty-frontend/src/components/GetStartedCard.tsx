'use client';

import React from "react";
import GitHubLinkCard from "./GitHubLinkCard";

interface GetStartedCardProps {
  className?: string;
}

const GetStartedCard: React.FC<GetStartedCardProps> = ({ className }) => {
  return <GitHubLinkCard className={className} />;
};

export default GetStartedCard;
