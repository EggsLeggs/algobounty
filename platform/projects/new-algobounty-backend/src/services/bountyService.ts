// Helper function to generate bounty key (used for reference, not chain interaction)
export const toBountyKey = (owner: string, repo: string, issueNumber: string) => `${owner}/${repo}#${issueNumber}`;
