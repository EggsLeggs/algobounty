import { MongoClient, Db } from "mongodb";
import { mongoDbName } from "../config/env.js";

let client: MongoClient | null = null;
let db: Db | null = null;

async function createClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoClient = await createClient();
  db = mongoClient.db(mongoDbName);
  return db;
}

export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

