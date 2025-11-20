import { MongoClient, Db, Collection } from "mongodb";

interface GitHubLink {
  github_id: number;
  github_username: string;
  github_name: string;
  github_avatar_url: string;
  github_html_url: string;
  algorand_address: string;
  created_at: Date;
  updated_at: Date;
}

interface NonceData {
  nonce: string;
  github_id: number;
  algorand_address: string;
  expires: Date;
  created_at: Date;
}

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (db) {
    return { client, db };
  }

  const uri = process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017/algo_bounty?authSource=admin";

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("algo_bounty");

    console.log("Connected to MongoDB successfully");
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function getGitHubLinksCollection(): Promise<Collection<GitHubLink>> {
  const { db } = await connectToDatabase();
  return db.collection<GitHubLink>("github_links");
}

export async function getNoncesCollection(): Promise<Collection<NonceData>> {
  const { db } = await connectToDatabase();
  return db.collection<NonceData>("nonces");
}

// GitHub Link operations
export async function storeGitHubLink(link: Omit<GitHubLink, "created_at" | "updated_at">): Promise<void> {
  const collection = await getGitHubLinksCollection();

  const now = new Date();
  await collection.insertOne({
    ...link,
    created_at: now,
    updated_at: now,
  });
}

export async function getGitHubLinkByAddress(algorandAddress: string): Promise<GitHubLink | null> {
  const collection = await getGitHubLinksCollection();
  return await collection.findOne({ algorand_address: algorandAddress });
}

export async function getGitHubLinkById(githubId: number): Promise<GitHubLink | null> {
  const collection = await getGitHubLinksCollection();
  return await collection.findOne({ github_id: githubId });
}

export async function deleteGitHubLink(githubId: number): Promise<boolean> {
  const collection = await getGitHubLinksCollection();
  const result = await collection.deleteOne({ github_id: githubId });
  return result.deletedCount > 0;
}

// Nonce operations
export async function storeNonce(nonceData: Omit<NonceData, "created_at">): Promise<void> {
  const collection = await getNoncesCollection();

  await collection.insertOne({
    ...nonceData,
    created_at: new Date(),
  });
}

export async function getNonce(nonce: string): Promise<NonceData | null> {
  const collection = await getNoncesCollection();
  return await collection.findOne({ nonce });
}

export async function deleteNonce(nonce: string): Promise<boolean> {
  const collection = await getNoncesCollection();
  const result = await collection.deleteOne({ nonce });
  return result.deletedCount > 0;
}

export async function cleanupExpiredNonces(): Promise<number> {
  const collection = await getNoncesCollection();
  const result = await collection.deleteMany({ expires: { $lt: new Date() } });
  return result.deletedCount;
}
