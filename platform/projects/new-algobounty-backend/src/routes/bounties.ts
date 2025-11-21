import { Router } from "express";
import { toBountyKey } from "../services/bountyService.js";

export const bountyRouter = Router();

// GET endpoint - returns bounty key for reference
// Note: All blockchain interactions should be handled by the frontend/dapp
bountyRouter.get("/:owner/:repo/:issueNumber", async (req, res, next) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const key = toBountyKey(owner, repo, issueNumber);
    res.json({
      key,
      message: "Bounty state should be queried directly from the blockchain via the dapp",
    });
  } catch (error) {
    next(error);
  }
});

// POST endpoints for close/claim have been removed
// All blockchain interactions (close, claim) should be handled by the frontend/dapp
