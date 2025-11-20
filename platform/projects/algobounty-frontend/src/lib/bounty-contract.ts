import algosdk from "algosdk";
import { IssueEscrowClient, IssueEscrowFactory } from "../contracts/IssueEscrow";

export interface BountyContractConfig {
  algodServer: string;
  algodToken: string;
  usdcAssetId: number;
}

export interface CreateBountyParams {
  issueId: string;
  maintainer: string;
  usdcAssetId: number;
  senderPrivateKey: string;
}

export interface FundBountyParams {
  contractAddress: string;
  amount: number; // in micro-USDC
  senderPrivateKey: string;
}

export interface BountyInfo {
  issueId: string;
  totalBounty: number;
  usdcAsset: number;
  maintainer: string;
  isResolved: boolean;
  initialized: boolean;
}

/**
 * Deploy a new issue escrow contract
 */
export async function deployBountyContract(
  params: CreateBountyParams,
  config: BountyContractConfig
): Promise<{ success: boolean; contractAddress?: string; appId?: number; txId?: string; error?: string }> {
  try {
    // Validate config
    if (!config) {
      throw new Error("Contract configuration is required");
    }
    if (!config.algodServer) {
      throw new Error("Algorand node configuration is incomplete. Please check your environment variables.");
    }

    // Create Algorand client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Create the contract factory
    const factory = new IssueEscrowFactory({
      algodClient,
    });

    // Deploy the contract
    const deployResult = await factory.deploy({
      version: "1.0.0",
      deployTimeParams: {},
    });

    console.log("Contract deployed:", {
      issueId: params.issueId,
      maintainer: params.maintainer,
      contractAddress: deployResult.result.appAddress,
      appId: deployResult.result.appId,
      txId: deployResult.result.transaction.txID(),
    });

    return {
      success: true,
      contractAddress: deployResult.result.appAddress,
      appId: deployResult.result.appId,
      txId: deployResult.result.transaction.txID(),
    };
  } catch (error) {
    console.error("Contract deployment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize a bounty contract with issue details
 */
export async function initializeBountyContract(
  appId: number,
  params: CreateBountyParams,
  config: BountyContractConfig
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    // Validate config
    if (!config) {
      throw new Error("Contract configuration is required");
    }
    if (!config.algodServer) {
      throw new Error("Algorand node configuration is incomplete. Please check your environment variables.");
    }

    // Create Algorand client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Create the contract client
    const client = new IssueEscrowClient({
      resolveBy: "id",
      id: appId,
      algodClient,
    });

    // Call create_bounty method
    const result = await client.send.createBounty({
      args: {
        issueId: params.issueId,
        usdcAsset: BigInt(params.usdcAssetId),
        maintainer: params.maintainer,
      },
      sender: params.senderPrivateKey,
    });

    console.log("Bounty initialized:", {
      appId,
      issueId: params.issueId,
      maintainer: params.maintainer,
      txId: result.transaction.txID(),
    });

    return {
      success: true,
      txId: result.transaction.txID(),
    };
  } catch (error) {
    console.error("Bounty initialization failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fund an existing bounty contract
 */
export async function fundBountyContract(
  appId: number,
  params: FundBountyParams,
  config: BountyContractConfig
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    // Validate config
    if (!config) {
      throw new Error("Contract configuration is required");
    }
    if (!config.algodServer) {
      throw new Error("Algorand node configuration is incomplete. Please check your environment variables.");
    }

    // Create Algorand client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Create the contract client
    const client = new IssueEscrowClient({
      resolveBy: "id",
      id: appId,
      algodClient,
    });

    // Call fund_bounty method
    const result = await client.send.fundBounty({
      args: {
        amount: BigInt(params.amount),
      },
      sender: params.senderPrivateKey,
      sendParams: {
        fee: 2000, // Include fee for asset transfer
        assetTransfers: [
          {
            assetId: config.usdcAssetId,
            amount: BigInt(params.amount),
            receiver: client.appAddress,
          },
        ],
      },
    });

    console.log("Bounty funded:", {
      amount: params.amount,
      contractAddress: params.contractAddress,
      txId: result.transaction.txID(),
    });

    return {
      success: true,
      txId: result.transaction.txID(),
    };
  } catch (error) {
    console.error("Bounty funding failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get bounty information from the contract
 */
export async function getBountyInfo(
  appId: number,
  config: BountyContractConfig
): Promise<{ success: boolean; data?: BountyInfo; error?: string }> {
  try {
    // Validate config
    if (!config) {
      throw new Error("Contract configuration is required");
    }
    if (!config.algodServer) {
      throw new Error("Algorand node configuration is incomplete. Please check your environment variables.");
    }

    // Create Algorand client
    const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, "");

    // Create the contract client
    const client = new IssueEscrowClient({
      resolveBy: "id",
      id: appId,
      algodClient,
    });

    // Call get_bounty_info method
    const result = await client.send.getBountyInfo({
      args: {},
    });

    // Parse the returned data
    const [issueId, totalBounty, usdcAsset, maintainer, isResolved, initialized] = result.return;

    const bountyInfo: BountyInfo = {
      issueId: issueId,
      totalBounty: Number(totalBounty),
      usdcAsset: Number(usdcAsset),
      maintainer: maintainer,
      isResolved: Number(isResolved) === 1,
      initialized: Number(initialized) === 1,
    };

    console.log("Bounty info retrieved:", bountyInfo);

    return {
      success: true,
      data: bountyInfo,
    };
  } catch (error) {
    console.error("Failed to get bounty info:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Note: Opt-in functions removed since native ALGO (asset ID 0) does not require opt-in
