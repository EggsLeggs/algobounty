import { Router } from "express";
import { getDb } from "../lib/mongo.js";

export const waitlistRouter = Router();

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

