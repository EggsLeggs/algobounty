import algosdk from "algosdk";
import { getAlgorandClient, getOperatorAccount } from "../lib/algorand.js";
import { BountyEscrowClient } from "@contracts/bounty_escrow/BountyEscrowClient.js";

const ZERO_ADDRESS = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
const APP_ID = Number(process.env.BOUNTY_ESCROW_APP_ID || "0");

if (!APP_ID) {
  throw new Error("BOUNTY_ESCROW_APP_ID is not defined. Set it in the backend .env file.");
}

const toBountyKey = (owner: string, repo: string, issueNumber: string) => `${owner}/${repo}#${issueNumber}`;

async function getContractClient() {
  const algorand = getAlgorandClient();
  const operator = await getOperatorAccount();

  return new BountyEscrowClient({
    algorand,
    app: { appId: APP_ID },
    defaultSender: operator.addr,
    defaultSigner: operator.signer,
  });
}

export async function getBountyState(owner: string, repo: string, issueNumber: string) {
  const key = toBountyKey(owner, repo, issueNumber);
  const client = await getContractClient();

  const [totalFunded, totalClaimed, closed, claimed, claimerBytes] = await Promise.all([
    client.getTotalFunded({ args: { bountyKey: key } }),
    client.getTotalClaimed({ args: { bountyKey: key } }),
    client.isBountyClosed({ args: { bountyKey: key } }),
    client.isBountyClaimed({ args: { bountyKey: key } }),
    client.getAuthorizedClaimer({ args: { bountyKey: key } }),
  ]);

  const authorizedClaimer =
    claimerBytes && algosdk.encodeAddress(claimerBytes) !== ZERO_ADDRESS
      ? algosdk.encodeAddress(claimerBytes)
      : null;

  return {
    key,
    totalFundedMicroAlgos: totalFunded.toString(),
    totalClaimedMicroAlgos: totalClaimed.toString(),
    isClosed: closed,
    isClaimed: claimed,
    authorizedClaimer,
  };
}

export async function markIssueClosed(owner: string, repo: string, issueNumber: string, claimerAddress?: string) {
  const client = await getContractClient();
  const key = toBountyKey(owner, repo, issueNumber);
  const claimer = claimerAddress ?? ZERO_ADDRESS;

  await client.send.markIssueClosed({
    args: {
      bountyKey: key,
      claimer,
    },
  });

  return key;
}

export async function claimBounty(owner: string, repo: string, issueNumber: string, recipientAddress: string) {
  const client = await getContractClient();
  const key = toBountyKey(owner, repo, issueNumber);

  // TODO: plug future attestation or claimant verification here.
  await client.send.claimBounty({
    args: {
      bountyKey: key,
      recipient: recipientAddress,
    },
  });

  return key;
}

