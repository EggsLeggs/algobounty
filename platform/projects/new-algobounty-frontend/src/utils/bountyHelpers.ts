import { BountyEscrowClient } from "@/contracts/BountyEscrow";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { getAlgodConfigFromViteEnvironment } from "./network/getAlgoClientConfigs";
import { makePaymentTxnWithSuggestedParamsFromObject, encodeUnsignedTransaction, assignGroupID } from "algosdk";
import algosdk from "algosdk";

/**
 * Builds a bounty key from owner, repo, and issue number
 * Format: `${owner}/${repo}#${issueNumber}`
 */
export function buildBountyKey(owner: string, repo: string, issueNumber: string): string {
  return `${owner}/${repo}#${issueNumber}`;
}

/**
 * Converts microAlgos to Algos
 */
export function microAlgosToAlgos(microAlgos: string | number | bigint): number {
  const microAlgosNum = typeof microAlgos === "string" ? BigInt(microAlgos) : BigInt(microAlgos);
  return Number(microAlgosNum) / 1_000_000;
}

/**
 * Creates a BountyEscrowClient instance
 */
async function getBountyEscrowClient(sender: string): Promise<BountyEscrowClient> {
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const appId = Number(import.meta.env.VITE_BOUNTY_ESCROW_APP_ID || "0");

  if (!appId) {
    throw new Error("VITE_BOUNTY_ESCROW_APP_ID is not defined. Set it in your .env file.");
  }

  // Create Algorand client using algosdk directly
  const algodClient = new algosdk.Algodv2(String(algodConfig.token), algodConfig.server, String(algodConfig.port));

  // Create AlgorandClient - use the client property structure
  // We'll create a minimal AlgorandClient-like object that works with BountyEscrowClient
  const algorand = {
    client: {
      algod: algodClient,
    },
  } as unknown as AlgorandClient;

  return new BountyEscrowClient({
    algorand,
    app: { appId },
    defaultSender: sender,
  } as any);
}

export interface FundBountyParams {
  bountyKey: string;
  amountAlgos: number;
  sender: string;
  signTransactions: (txns: Uint8Array[]) => Promise<(Uint8Array | null)[]>;
}

/**
 * Funds a bounty on-chain by creating an atomic transaction group with:
 * 1. A payment transaction from sender to the app (index 0)
 * 2. The fundBounty app call (index 1)
 */
export async function fundBountyOnChain(params: FundBountyParams): Promise<void> {
  const { bountyKey, amountAlgos, sender, signTransactions } = params;

  const client = await getBountyEscrowClient(sender);
  const appAddress = client.appAddress;
  const algorand = client.algorand;

  // Convert Algos to microAlgos
  const amountMicroAlgos = BigInt(Math.floor(amountAlgos * 1_000_000));

  // Get suggested transaction parameters
  const suggestedParams = await algorand.client.algod.getTransactionParams().do();

  // Create payment transaction (will be index 0 in the atomic group)
  const paymentTxn = makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender,
    receiver: appAddress,
    amount: Number(amountMicroAlgos),
    suggestedParams,
  });

  // Get the app call transaction group
  const appCallTxnGroup = await client.createTransaction.fundBounty({
    args: {
      bountyKey,
      paymentTxnIndex: 0,
    },
  });

  // Extract the actual transaction from the group
  // The createTransaction returns a group structure, we need the first transaction
  const appCallTxn = appCallTxnGroup.transactions[0]!;

  // Assign group ID to both transactions
  const txns = assignGroupID([paymentTxn, appCallTxn]);

  // Encode transactions for signing
  const txnsToSign = txns.map((txn) => encodeUnsignedTransaction(txn));

  // Sign with wallet
  const signedTxns = await signTransactions(txnsToSign);
  const signedTxnsFiltered = signedTxns.filter((txn): txn is Uint8Array => txn !== null);

  if (signedTxnsFiltered.length !== txnsToSign.length) {
    throw new Error("Some transactions failed to sign");
  }

  // Submit the signed transactions
  await algorand.client.algod.sendRawTransaction(signedTxnsFiltered).do();

  // Wait for confirmation (just wait a bit, the transaction will be processed)
  // Note: In production, you might want to implement proper confirmation waiting
}

export interface ClaimBountyParams {
  bountyKey: string;
  sender: string;
  recipient: string;
  signTransactions: (txns: Uint8Array[]) => Promise<(Uint8Array | null)[]>;
}

/**
 * Claims a bounty on-chain
 */
export async function claimBountyOnChain(params: ClaimBountyParams): Promise<void> {
  const { bountyKey, sender, recipient, signTransactions } = params;

  const client = await getBountyEscrowClient(sender);
  const algorand = client.algorand;

  // Get the transaction group
  const txnGroup = await client.createTransaction.claimBounty({
    args: {
      bountyKey,
      recipient,
    },
  });

  // Extract the actual transaction from the group
  const txn = txnGroup.transactions[0]!;

  // Encode for signing
  const txnToSign = encodeUnsignedTransaction(txn);

  // Sign with wallet
  const signed = await signTransactions([txnToSign]);
  const signedTxn = signed[0];

  if (!signedTxn) {
    throw new Error("Transaction signing failed");
  }

  // Submit
  await algorand.client.algod.sendRawTransaction(signedTxn).do();

  // Wait for confirmation (just wait a bit, the transaction will be processed)
  // Note: In production, you might want to implement proper confirmation waiting
}
