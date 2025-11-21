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

    const githubLinkedAt = attestation?.githubLinkedAt ?? attestation?.createdAt;
    const attestationSignedAt = attestation?.attestationSignedAt ?? githubLinkedAt;
    const storedAt = attestation?.storedAt ?? attestationSignedAt;

    const stages = [
      {
        id: "github-oauth",
        label: "Connect GitHub",
        status: githubLinkedAt ? "complete" : "pending",
        completedAt: githubLinkedAt ? githubLinkedAt.toISOString() : null,
        description: "Authenticate with GitHub so we can verify your identity.",
      },
      {
        id: "attestation-sign",
        label: "Sign Attestation",
        status: attestationSignedAt ? "complete" : "pending",
        completedAt: attestationSignedAt ? attestationSignedAt.toISOString() : null,
        description: "Link your wallet address to your GitHub account via a signed attestation.",
      },
      {
        id: "commit-record",
        label: "Commit Link",
        status: storedAt ? "complete" : "pending",
        completedAt: storedAt ? storedAt.toISOString() : null,
        description: "Store the verified link (simulated on MongoDB in demo mode).",
      },
    ];

    if (!attestation) {
      return res.json({ linked: false, stages });
    }

    res.json({
      linked: true,
      githubId: attestation.githubId,
      githubUsername: attestation.githubUsername,
      stages,
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

