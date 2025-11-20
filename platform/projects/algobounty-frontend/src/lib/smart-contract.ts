import algosdk from "algosdk";

export interface LinkTransactionParams {
  githubId: number;
  algorandAddress: string;
  expiry: number;
  nonce: string;
  attestorPubkey: string;
  signature: string;
}

export interface ContractConfig {
  appId: number;
  appAddress: string;
  algodServer: string;
  algodToken: string;
  backendPrivateKey: string;
}

/**
 * Submit a link transaction to the smart contract
 */
export async function submitLinkTransaction(
  params: LinkTransactionParams,
  config: ContractConfig
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    // Create Algod client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Convert inputs to bytes
    const githubIdBytes = algosdk.encodeUint64(params.githubId);
    const algorandAddressBytes = new Uint8Array(Buffer.from(params.algorandAddress));
    const expiryBytes = algosdk.encodeUint64(params.expiry);
    const nonceBytes = new Uint8Array(Buffer.from(params.nonce, "hex"));
    const attestorPubkeyBytes = new Uint8Array(Buffer.from(params.attestorPubkey, "base64"));
    const signatureBytes = new Uint8Array(Buffer.from(params.signature, "base64"));

    // Create application call transaction
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: config.backendPrivateKey,
      suggestedParams,
      appIndex: config.appId,
      appArgs: [
        new Uint8Array(Buffer.from("link")), // method name
        githubIdBytes,
        algorandAddressBytes,
        expiryBytes,
        nonceBytes,
        attestorPubkeyBytes,
        signatureBytes,
      ],
    });

    // Sign the transaction
    const signedTxn = appCallTxn.signTxn(new Uint8Array(Buffer.from(config.backendPrivateKey, "base64")));

    // Submit the transaction
    const result = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      result.txid,
      4 // wait up to 4 rounds
    );

    if (confirmedTxn.confirmedRound) {
      return {
        success: true,
        txId: result.txid,
      };
    } else {
      return {
        success: false,
        error: "Transaction not confirmed",
      };
    }
  } catch (error) {
    console.error("Link transaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get the linked Algorand address for a GitHub ID
 */
export async function getGitHubLink(githubId: number, config: ContractConfig): Promise<string | null> {
  try {
    // Create Algod client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Create box key
    const githubBoxKey = new Uint8Array(Buffer.from("gh:" + githubId.toString()));

    // Get box contents
    const boxInfo = await algodClient.getApplicationBoxByName(config.appId, githubBoxKey).do();

    if (boxInfo.value) {
      return new TextDecoder().decode(new Uint8Array(boxInfo.value));
    }

    return null;
  } catch (error) {
    console.error("Failed to get GitHub link:", error);
    return null;
  }
}

/**
 * Revoke a GitHub link
 */
export async function revokeGitHubLink(
  githubId: number,
  config: ContractConfig
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    // Create Algod client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Convert GitHub ID to bytes
    const githubIdBytes = algosdk.encodeUint64(githubId);

    // Create application call transaction
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: config.backendPrivateKey,
      suggestedParams,
      appIndex: config.appId,
      appArgs: [
        new Uint8Array(Buffer.from("revoke")), // method name
        githubIdBytes,
      ],
    });

    // Sign the transaction
    const signedTxn = appCallTxn.signTxn(new Uint8Array(Buffer.from(config.backendPrivateKey, "base64")));

    // Submit the transaction
    const result = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      result.txid,
      4 // wait up to 4 rounds
    );

    if (confirmedTxn.confirmedRound) {
      return {
        success: true,
        txId: result.txid,
      };
    } else {
      return {
        success: false,
        error: "Transaction not confirmed",
      };
    }
  } catch (error) {
    console.error("Revoke transaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
