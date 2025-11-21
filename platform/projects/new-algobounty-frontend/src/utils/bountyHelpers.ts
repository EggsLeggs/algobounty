import { BountyEscrowClient, BountyEscrowFactory } from "@/contracts/BountyEscrow";
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
  console.log("[getBountyEscrowClient] Starting, sender:", sender);

  const algodConfig = getAlgodConfigFromViteEnvironment();
  console.log("[getBountyEscrowClient] Got algod config");

  const appIdEnv = import.meta.env.VITE_BOUNTY_ESCROW_APP_ID || "0";
  console.log("[getBountyEscrowClient] App ID from env:", appIdEnv, "type:", typeof appIdEnv);

  // getAppClientById expects bigint, but we'll let the factory handle the conversion
  const appId = BigInt(appIdEnv);
  console.log("[getBountyEscrowClient] App ID as BigInt:", appId, "type:", typeof appId);

  if (!appId || appId === 0n) {
    throw new Error("VITE_BOUNTY_ESCROW_APP_ID is not defined. Set it in your .env file.");
  }

  // Create AlgorandClient using the proper fromConfig method (like the reference implementation)
  console.log("[getBountyEscrowClient] Creating AlgorandClient from config...");
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
  });
  console.log("[getBountyEscrowClient] AlgorandClient created");

  console.log("[getBountyEscrowClient] Creating BountyEscrowFactory...");
  const factory = new BountyEscrowFactory({
    algorand,
    defaultSender: sender,
  });
  console.log("[getBountyEscrowClient] Factory created");

  console.log("[getBountyEscrowClient] Getting BountyEscrowClient by ID:", {
    appId,
    appIdType: typeof appId,
    appIdValue: appId,
  });

  try {
    // Use getAppClientById which might handle the appId conversion better
    const client = factory.getAppClientById({
      appId: appId,
    });
    console.log("[getBountyEscrowClient] BountyEscrowClient created successfully");
    return client;
  } catch (error) {
    console.error("[getBountyEscrowClient] ERROR creating BountyEscrowClient:", error);
    console.error("[getBountyEscrowClient] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw error;
  }
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
  console.log("[fundBountyOnChain] Starting with params:", params);

  const { bountyKey, amountAlgos, sender, signTransactions } = params;

  // Validate input amount
  console.log("[fundBountyOnChain] Validating amount:", amountAlgos);
  if (!Number.isFinite(amountAlgos) || amountAlgos <= 0) {
    throw new Error(`Invalid amount: ${amountAlgos} ALGO must be a positive number`);
  }

  console.log("[fundBountyOnChain] Getting BountyEscrowClient...");
  const client = await getBountyEscrowClient(sender);
  console.log("[fundBountyOnChain] Client created, appAddress:", client.appAddress);
  const appAddress = client.appAddress;
  const algorand = client.algorand;

  // Convert Algos to microAlgos using string-based conversion to avoid floating point precision issues
  // This ensures we get exact integer values without floating point errors
  const amountStr = amountAlgos.toFixed(6); // Support up to 6 decimal places (microAlgo precision)
  const [integerPart, decimalPart = ""] = amountStr.split(".");
  const decimalMicroAlgos = decimalPart.padEnd(6, "0").slice(0, 6); // Pad to 6 digits, max 6

  // Use BigInt for precise calculation, then convert to number for algosdk
  const integerMicroAlgos = BigInt(integerPart) * BigInt(1_000_000);
  const decimalMicroAlgosBigInt = BigInt(decimalMicroAlgos);
  const totalMicroAlgosBigInt = integerMicroAlgos + decimalMicroAlgosBigInt;

  // Validate the amount is within uint64 range (0 to 2^64 - 1)
  const MAX_UINT64 = BigInt("18446744073709551615"); // 2^64 - 1
  if (totalMicroAlgosBigInt < 0n || totalMicroAlgosBigInt > MAX_UINT64) {
    throw new Error(`Invalid amount: ${totalMicroAlgosBigInt} microAlgos is out of uint64 range`);
  }

  // Convert to number for algosdk (safe as long as it's within Number.MAX_SAFE_INTEGER)
  const totalMicroAlgos = Number(totalMicroAlgosBigInt);

  // Double-check it's a safe integer
  if (!Number.isSafeInteger(totalMicroAlgos)) {
    throw new Error(`Invalid amount: ${totalMicroAlgos} microAlgos exceeds safe integer range`);
  }

  // Get suggested transaction parameters
  console.log("[fundBountyOnChain] Getting suggested transaction params...");
  const suggestedParams = await algorand.client.algod.getTransactionParams().do();
  console.log("[fundBountyOnChain] Suggested params received");

  // Create payment transaction (will be index 0 in the atomic group)
  console.log("[fundBountyOnChain] Creating payment transaction with:", {
    sender,
    receiver: appAddress,
    amount: totalMicroAlgos,
    amountType: typeof totalMicroAlgos,
  });
  const paymentTxn = makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender,
    receiver: appAddress,
    amount: totalMicroAlgos,
    suggestedParams,
  });
  console.log("[fundBountyOnChain] Payment transaction created successfully");

  // Get the app call transaction
  // paymentTxnIndex must be a uint64 (0) representing the index of the payment transaction in the group
  // Based on forum discussion, some algosdk functions may not accept BigInt even if types suggest they do
  // Try using number first, as the ABI encoder might handle the conversion internally
  console.log("[fundBountyOnChain] Preparing app call transaction...");
  const paymentTxnIndexValue = 0;

  // Debug: Log the values being passed
  const fundBountyArgs = {
    bountyKey: String(bountyKey), // Ensure it's a string
    paymentTxnIndex: paymentTxnIndexValue, // Try number instead of BigInt
  };

  console.log("[fundBountyOnChain] About to call createTransaction.fundBounty with args:", {
    ...fundBountyArgs,
    paymentTxnIndexType: typeof fundBountyArgs.paymentTxnIndex,
    paymentTxnIndexValue: fundBountyArgs.paymentTxnIndex,
    bountyKeyType: typeof fundBountyArgs.bountyKey,
  });

  let appCallTxnGroup;
  try {
    console.log("[fundBountyOnChain] Calling client.createTransaction.fundBounty...");
    appCallTxnGroup = await client.createTransaction.fundBounty({
      args: fundBountyArgs,
    });
    console.log("[fundBountyOnChain] createTransaction.fundBounty succeeded, transactions:", appCallTxnGroup.transactions?.length);
  } catch (error) {
    console.error("[fundBountyOnChain] ERROR in createTransaction.fundBounty:", error);
    console.error("[fundBountyOnChain] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw error;
  }

  // Extract the actual transaction from the group
  // The createTransaction returns a group structure, we need the first transaction
  console.log("[fundBountyOnChain] Extracting app call transaction from group...");
  const appCallTxn = appCallTxnGroup.transactions[0]!;
  console.log("[fundBountyOnChain] App call transaction extracted");

  // Assign group ID to both transactions
  console.log("[fundBountyOnChain] Assigning group ID to transactions...");
  const txns = assignGroupID([paymentTxn, appCallTxn]);
  console.log("[fundBountyOnChain] Group ID assigned, transaction count:", txns.length);

  // Encode transactions for signing
  console.log("[fundBountyOnChain] Encoding transactions for signing...");
  const txnsToSign = txns.map((txn: algosdk.Transaction) => {
    try {
      return encodeUnsignedTransaction(txn);
    } catch (error) {
      console.error("[fundBountyOnChain] Error encoding transaction:", error);
      throw error;
    }
  });
  console.log("[fundBountyOnChain] Transactions encoded, count:", txnsToSign.length);

  // Sign with wallet
  console.log("[fundBountyOnChain] Requesting wallet signature...");
  const signedTxns = await signTransactions(txnsToSign);
  console.log("[fundBountyOnChain] Wallet signature received, signed count:", signedTxns.length);
  const signedTxnsFiltered = signedTxns.filter((txn): txn is Uint8Array => txn !== null);

  if (signedTxnsFiltered.length !== txnsToSign.length) {
    throw new Error("Some transactions failed to sign");
  }

  // Submit the signed transactions
  console.log("[fundBountyOnChain] Submitting transactions to network...");
  await algorand.client.algod.sendRawTransaction(signedTxnsFiltered).do();
  console.log("[fundBountyOnChain] Transactions submitted successfully");

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
