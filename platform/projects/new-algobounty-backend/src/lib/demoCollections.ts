import type { Collection, Document } from "mongodb";
import { getDb } from "./mongo.js";

export interface DemoBountyDocument {
  bountyKey: string;
  owner: string;
  repo: string;
  issueNumber: string;
  totalFundedMicroAlgos: number;
  totalClaimedMicroAlgos: number;
  isClosed: boolean;
  isClaimed: boolean;
  authorizedClaimer: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoFundingDocument {
  bountyKey: string;
  amountMicroAlgos: number;
  funderAddress: string | null;
  createdAt: Date;
}

export interface DemoAttestationDocument {
  githubId: string;
  githubUsername: string;
  algorandAddress: string;
  attestation: unknown;
  createdAt: Date;
  githubLinkedAt?: Date;
  attestationSignedAt?: Date;
  storedAt?: Date;
}

export interface DemoAttestationStateDocument {
  state: string;
  algorandAddress: string;
  createdAt: Date;
}

const initializedCollections = new Set<string>();

async function ensureIndexes<T extends Document>(
  collection: Collection<T>,
  collectionName: string,
  indexes: Parameters<Collection<T>["createIndex"]>[],
) {
  if (initializedCollections.has(collectionName)) {
    return collection;
  }

  for (const [indexSpec, options] of indexes) {
    await collection.createIndex(indexSpec, options);
  }

  initializedCollections.add(collectionName);
  return collection;
}

export async function getDemoBountiesCollection() {
  const db = await getDb();
  const collection = db.collection<DemoBountyDocument>("demo_bounties");
  return ensureIndexes(collection, "demo_bounties", [[{ bountyKey: 1 }, { unique: true }]]);
}

export async function getDemoFundingCollection() {
  const db = await getDb();
  const collection = db.collection<DemoFundingDocument>("demo_funding");
  return ensureIndexes(collection, "demo_funding", [[{ bountyKey: 1, createdAt: -1 }, {}]]);
}

export async function getDemoAttestationsCollection() {
  const db = await getDb();
  const collection = db.collection<DemoAttestationDocument>("demo_attestations");
  return ensureIndexes(collection, "demo_attestations", [
    [{ githubId: 1 }, { unique: true }],
    [{ algorandAddress: 1 }, { unique: true }],
  ]);
}

export async function getDemoAttestationStatesCollection() {
  const db = await getDb();
  const collection = db.collection<DemoAttestationStateDocument>("demo_attestation_states");
  return ensureIndexes(collection, "demo_attestation_states", [
    [{ state: 1 }, { unique: true }],
    [{ createdAt: 1 }, { expireAfterSeconds: 600 }],
  ]);
}

