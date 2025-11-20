/**
 * Common utility functions for bounty-related operations
 */

/**
 * Generates a bounty funding link for a GitHub issue
 * @param repositoryFullName - The full repository name (e.g., "owner/repo")
 * @param issueNumber - The issue number
 * @param appUrl - The base URL of the application (optional, defaults to localhost)
 * @returns The formatted bounty link
 */
export function generateBountyLink(
  repositoryFullName: string,
  issueNumber: number,
  appUrl?: string
): string {
  const baseUrl =
    appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `[💰 Fund this issue with AlgoBounty](${baseUrl}/fund?issue=${repositoryFullName}/issues/${issueNumber})`;
}

/**
 * Checks if a bounty link exists in the issue description
 * @param issueDescription - The issue description/body text
 * @returns True if the bounty link exists, false otherwise
 */
export function hasBountyLink(issueDescription: string): boolean {
  return issueDescription.includes("Fund this issue with AlgoBounty");
}

/**
 * Generates a bounty award link for a GitHub issue
 * @param repositoryFullName - The full repository name (e.g., "owner/repo")
 * @param issueNumber - The issue number
 * @param appUrl - The base URL of the application (optional, defaults to localhost)
 * @returns The formatted award link
 */
export function generateAwardLink(
  repositoryFullName: string,
  issueNumber: number,
  appUrl?: string
): string {
  const baseUrl =
    appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `[🏆 Award bounty for this issue](${baseUrl}/award?issue=${repositoryFullName}/issues/${issueNumber})`;
}

/**
 * Extracts repository and issue information from a GitHub issue URL
 * @param issueUrl - The GitHub issue URL
 * @returns Object with owner, repo, and issueNumber, or null if invalid
 */
export function parseGitHubIssueUrl(issueUrl: string): {
  owner: string;
  repo: string;
  issueNumber: number;
  fullName: string;
} | null {
  const githubUrlPattern =
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)$/;
  const match = issueUrl.match(githubUrlPattern);

  if (!match) {
    return null;
  }

  const [, owner, repo, issueNumber] = match;
  return {
    owner,
    repo,
    issueNumber: parseInt(issueNumber, 10),
    fullName: `${owner}/${repo}`,
  };
}
