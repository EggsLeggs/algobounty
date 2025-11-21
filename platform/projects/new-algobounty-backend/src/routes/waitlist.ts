import { Router } from "express";
import { MongoClient, Db } from "mongodb";

export const waitlistRouter = Router();

// MongoDB connection (lazy initialization)
let db: Db | null = null;
let client: MongoClient | null = null;

async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db("algo_bounty");
    console.log("✅ Connected to MongoDB for waitlist");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// POST endpoint - submit waitlist/feedback form
waitlistRouter.post("/", async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Get database connection
    const database = await getDb();
    const collection = database.collection("waitlist");

    // Check if email already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Insert waitlist entry
    const result = await collection.insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Thanks for joining our waitlist!",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error submitting waitlist entry:", error);
    next(error);
  }
});

// Graceful shutdown - close MongoDB connection
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

