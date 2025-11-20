import { Router } from "express";
import { claimBounty, getBountyState, markIssueClosed } from "../services/bountyService.js";

export const bountyRouter = Router();

bountyRouter.get("/:owner/:repo/:issueNumber", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const state = await getBountyState(owner, repo, issueNumber);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

bountyRouter.post("/:owner/:repo/:issueNumber/close", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { claimerAddress } = req.body as { claimerAddress?: string };

    const key = await markIssueClosed(owner, repo, issueNumber, claimerAddress);
    res.json({ success: true, key });
  } catch (error) {
    next(error);
  }
});

bountyRouter.post("/:owner/:repo/:issueNumber/claim", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { recipientAddress } = req.body as { recipientAddress?: string };

    if (!recipientAddress) {
      return res.status(400).json({ error: "recipientAddress is required" });
    }

    // TODO: enforce attestation to verify the claimer before allowing payouts.
    const key = await claimBounty(owner, repo, issueNumber, recipientAddress);
    res.json({ success: true, key });
  } catch (error) {
    next(error);
  }
});

