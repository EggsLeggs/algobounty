import { NextRequest, NextResponse } from "next/server";

interface BountyRequest {
  issueId: string;
  repository: string;
  amount: number;
  maintainer: string;
}

interface BountyResponse {
  contractAddress: string;
  transactionId: string;
  bountyId: string;
}

// In-memory storage for demo (replace with database in production)
const bounties = new Map<
  string,
  BountyRequest &
    BountyResponse & {
      createdAt: string;
      status: string;
      resolvedAt?: string;
      distributions?: Array<{
        contributor: string;
        amount: number;
        distributedAt: string;
      }>;
    }
>();

export async function POST(request: NextRequest) {
  try {
    const body: BountyRequest = await request.json();

    const { issueId, repository, amount, maintainer } = body;

    // Validate request
    if (!issueId || !repository || !amount || !maintainer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Bounty amount must be positive" },
        { status: 400 }
      );
    }

    // Create bounty ID
    const bountyId = `${repository}#${issueId}`;

    // Check if bounty already exists
    if (bounties.has(bountyId)) {
      return NextResponse.json(
        { error: "Bounty already exists for this issue" },
        { status: 409 }
      );
    }

    // TODO: Deploy smart contract and fund it
    // For now, simulate the response
    const mockResponse: BountyResponse = {
      contractAddress: `ESCROW_${Date.now()}`,
      transactionId: `TXN_${Date.now()}`,
      bountyId,
    };

    // Store bounty info
    bounties.set(bountyId, {
      ...body,
      ...mockResponse,
      createdAt: new Date().toISOString(),
      status: "active",
    });

    console.log("Bounty created:", mockResponse);

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error creating bounty:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get("issueId");
    const repository = searchParams.get("repository");

    if (issueId && repository) {
      // Get specific bounty
      const bountyId = `${repository}#${issueId}`;
      const bounty = bounties.get(bountyId);

      if (!bounty) {
        return NextResponse.json(
          { error: "Bounty not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(bounty);
    } else {
      // Get all bounties
      const allBounties = Array.from(bounties.values());
      return NextResponse.json(allBounties);
    }
  } catch (error) {
    console.error("Error fetching bounties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bountyId, action, contributor, amount } = body;

    const bounty = bounties.get(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    switch (action) {
      case "mark_resolved":
        bounty.status = "resolved";
        bounty.resolvedAt = new Date().toISOString();
        break;

      case "distribute":
        if (!contributor || !amount) {
          return NextResponse.json(
            { error: "Contributor and amount required for distribution" },
            { status: 400 }
          );
        }

        // TODO: Call smart contract to distribute funds
        bounty.distributions = bounty.distributions || [];
        bounty.distributions.push({
          contributor,
          amount,
          distributedAt: new Date().toISOString(),
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    bounties.set(bountyId, bounty);

    return NextResponse.json({ success: true, bounty });
  } catch (error) {
    console.error("Error updating bounty:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
