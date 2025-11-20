import { AlgorandClient } from "@algorandfoundation/algokit-utils";

let cachedClient: AlgorandClient | null = null;
let cachedOperatorPromise: Promise<Awaited<ReturnType<AlgorandClient["account"]["fromEnvironment"]>>> | null = null;

export function getAlgorandClient() {
  if (!cachedClient) {
    cachedClient = AlgorandClient.fromEnvironment();
  }
  return cachedClient;
}

export async function getOperatorAccount() {
  if (!cachedOperatorPromise) {
    const algorand = getAlgorandClient();
    // Defaults to BOUNTY_ESCROW_OPERATOR_MNEMONIC env var
    const operatorLabel = process.env.BOUNTY_ESCROW_OPERATOR_LABEL || "BOUNTY_ESCROW_OPERATOR";
    cachedOperatorPromise = algorand.account.fromEnvironment(operatorLabel);
  }
  return cachedOperatorPromise;
}

