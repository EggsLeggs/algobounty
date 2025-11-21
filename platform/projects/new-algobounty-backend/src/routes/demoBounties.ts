import { Router } from "express";
import { Octokit } from "@octokit/rest";
import { getDemoAttestationsCollection, getDemoBountiesCollection, getDemoFundingCollection } from "../lib/demoCollections.js";
import type { DemoBountyDocument } from "../lib/demoCollections.js";
import { toBountyKey } from "../services/bountyService.js";

const octokit = new Octokit({
  userAgent: "AlgoBountyDemo/1.0",
});

export const demoBountiesRouter = Router();

interface RouteParams {
  owner: string;
  repo: string;
  issueNumber: string;
}

function parseParams(params: RouteParams) {
  const owner = params.owner;
  const repo = params.repo;
  const issueNumber = params.issueNumber;

  if (!owner || !repo || !issueNumber) {
    throw new Error("Missing bounty identifiers");
  }

  return { owner, repo, issueNumber, bountyKey: toBountyKey(owner, repo, issueNumber) };
}

async function fetchIssueClosedState(owner: string, repo: string, issueNumber: string) {
  try {
    const { data } = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: Number(issueNumber),
    });
    return data.state === "closed";
  } catch (error) {
    console.warn("Unable to fetch GitHub issue state, falling back to stored value:", error);
    return null;
  }
}

async function ensureBountyDocument(owner: string, repo: string, issueNumber: string): Promise<DemoBountyDocument> {
  const { bountyKey } = parseParams({ owner, repo, issueNumber });
  const collection = await getDemoBountiesCollection();
  const existing = await collection.findOne({ bountyKey });
  if (existing) {
    return existing;
  }

  const now = new Date();
  const isClosed = (await fetchIssueClosedState(owner, repo, issueNumber)) ?? false;
  const doc: DemoBountyDocument = {
    bountyKey,
    owner,
    repo,
    issueNumber,
    totalFundedMicroAlgos: 0,
    totalClaimedMicroAlgos: 0,
    isClosed,
    isClaimed: false,
    authorizedClaimer: null,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(doc);
  return doc;
}

async function refreshClosedState(doc: DemoBountyDocument) {
  const latestState = await fetchIssueClosedState(doc.owner, doc.repo, doc.issueNumber);
  if (latestState === null || latestState === doc.isClosed) {
    return doc;
  }

  const collection = await getDemoBountiesCollection();
  const { value } = await collection.findOneAndUpdate(
    { bountyKey: doc.bountyKey },
    { $set: { isClosed: latestState, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return value ?? doc;
}

function formatResponse(doc: DemoBountyDocument) {
  return {
    bountyKey: doc.bountyKey,
    totalFundedMicroAlgos: doc.totalFundedMicroAlgos,
    totalClaimedMicroAlgos: doc.totalClaimedMicroAlgos,
    isClosed: doc.isClosed,
    isClaimed: doc.isClaimed,
    authorizedClaimer: doc.authorizedClaimer,
    owner: doc.owner,
    repo: doc.repo,
    issueNumber: doc.issueNumber,
    updatedAt: doc.updatedAt,
  };
}

demoBountiesRouter.get("/:owner/:repo/:issueNumber", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params as RouteParams;
    let doc = await ensureBountyDocument(owner, repo, issueNumber);
    doc = await refreshClosedState(doc);
    res.json(formatResponse(doc));
  } catch (error) {
    next(error);
  }
});

demoBountiesRouter.get("/:owner/:repo/:issueNumber/state", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params as RouteParams;
    let doc = await ensureBountyDocument(owner, repo, issueNumber);
    doc = await refreshClosedState(doc);
    res.json(formatResponse(doc));
  } catch (error) {
    next(error);
  }
});

demoBountiesRouter.post("/:owner/:repo/:issueNumber/fund", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber, bountyKey } = parseParams(req.params as RouteParams);
    const amountAlgos = Number(req.body?.amountAlgos);
    const funderAddress = typeof req.body?.funderAddress === "string" ? req.body.funderAddress : null;

    if (!Number.isFinite(amountAlgos) || amountAlgos <= 0) {
      return res.status(400).json({ error: "Invalid funding amount" });
    }

    const microAmount = Math.round(amountAlgos * 1_000_000);
    if (!Number.isFinite(microAmount) || microAmount <= 0) {
      return res.status(400).json({ error: "Invalid microAlgos value" });
    }

    const fundingCollection = await getDemoFundingCollection();
    const bountyCollection = await getDemoBountiesCollection();

    let doc = await ensureBountyDocument(owner, repo, issueNumber);
    doc = await refreshClosedState(doc);

    if (doc.isClosed) {
      return res.status(400).json({ error: "This bounty is closed and cannot receive additional funding" });
    }

    await fundingCollection.insertOne({
      bountyKey,
      amountMicroAlgos: microAmount,
      funderAddress,
      createdAt: new Date(),
    });

    const { value: updatedDoc } = await bountyCollection.findOneAndUpdate(
      { bountyKey },
      {
        $inc: { totalFundedMicroAlgos: microAmount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );

    res.json(formatResponse(updatedDoc ?? doc));
  } catch (error) {
    next(error);
  }
});

demoBountiesRouter.post("/:owner/:repo/:issueNumber/claim", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber, bountyKey } = parseParams(req.params as RouteParams);
    const claimerAddress = typeof req.body?.claimerAddress === "string" ? req.body.claimerAddress : null;

    if (!claimerAddress) {
      return res.status(400).json({ error: "Claimer address is required" });
    }

    const bountyCollection = await getDemoBountiesCollection();
    let doc = await ensureBountyDocument(owner, repo, issueNumber);
    doc = await refreshClosedState(doc);

    if (!doc.isClosed) {
      return res.status(400).json({ error: "Issue is not closed yet" });
    }

    if (doc.isClaimed) {
      return res.status(400).json({ error: "Bounty already claimed" });
    }

    const attestationCollection = await getDemoAttestationsCollection();
    const attestation = await attestationCollection.findOne({ algorandAddress: claimerAddress });
    if (!attestation) {
      return res.status(403).json({ error: "GitHub account not linked for this wallet" });
    }

    const { value: updatedDoc } = await bountyCollection.findOneAndUpdate(
      { bountyKey },
      {
        $set: {
          isClaimed: true,
          authorizedClaimer: claimerAddress,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    res.json({
      ...formatResponse(updatedDoc ?? doc),
      message: "Claim recorded in demo mode. Funds are not transferred in this environment.",
    });
  } catch (error) {
    next(error);
  }
});

