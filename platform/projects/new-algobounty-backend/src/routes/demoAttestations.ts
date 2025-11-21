import { Router } from "express";
import { randomUUID } from "crypto";
import {
  getDemoAttestationStatesCollection,
  getDemoAttestationsCollection,
} from "../lib/demoCollections.js";

export const demoAttestationsRouter = Router();

demoAttestationsRouter.get("/check/:algorandAddress", async (req, res, next) => {
  try {
    const algorandAddress = req.params.algorandAddress;
    if (!algorandAddress) {
      return res.status(400).json({ error: "Algorand address is required" });
    }

    const collection = await getDemoAttestationsCollection();
    const attestation = await collection.findOne({ algorandAddress });

    if (!attestation) {
      return res.json({ linked: false });
    }

    res.json({
      linked: true,
      githubId: attestation.githubId,
      githubUsername: attestation.githubUsername,
    });
  } catch (error) {
    next(error);
  }
});

demoAttestationsRouter.post("/start", async (req, res, next) => {
  try {
    const algorandAddress = req.body?.algorandAddress;
    if (typeof algorandAddress !== "string" || algorandAddress.length === 0) {
      return res.status(400).json({ error: "Algorand address is required" });
    }

    const state = randomUUID();
    const collection = await getDemoAttestationStatesCollection();
    await collection.insertOne({
      state,
      algorandAddress,
      createdAt: new Date(),
    });

    res.json({
      state,
      expiresInSeconds: 600,
    });
  } catch (error) {
    next(error);
  }
});

