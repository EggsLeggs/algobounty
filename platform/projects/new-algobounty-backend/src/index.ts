// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module (for ESM compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the project root (one level up from src/)
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Debug: Log if env vars are loaded (only in development)
if (process.env.NODE_ENV !== "production") {
  console.log(`📄 Loading .env from: ${envPath}`);
  console.log(`✅ GITHUB_APP_ID: ${process.env.GITHUB_APP_ID ? "SET" : "NOT SET"}`);
  console.log(`✅ GITHUB_APP_PRIVATE_KEY: ${process.env.GITHUB_APP_PRIVATE_KEY ? "SET" : "NOT SET"}`);
  console.log(`✅ GITHUB_WEBHOOK_SECRET: ${process.env.GITHUB_WEBHOOK_SECRET ? "SET" : "NOT SET"}`);
}

import express from "express";
import cors from "cors";
import { webhookRouter } from "./routes/webhooks.js";
import { authRouter } from "./routes/auth.js";
import { githubRouter } from "./routes/github.js";
import { attestationRouter } from "./routes/attestations.js";
import { bountyImageRouter, generateBountyImage } from "./routes/bountyImage.js";
import { bountyRouter } from "./routes/bounties.js";
import { waitlistRouter } from "./routes/waitlist.js";
import { isDemoMode } from "./config/env.js";
import { closeMongoConnection } from "./lib/mongo.js";
import { demoBountiesRouter } from "./routes/demoBounties.js";
import { demoAttestationsRouter } from "./routes/demoAttestations.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// Webhook route needs raw body for signature verification
// Apply raw body parser specifically to webhook route BEFORE JSON parser
app.use("/api/webhooks", express.raw({ type: "application/json" }));

// JSON parser for all other routes
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/webhooks", webhookRouter);
app.use("/api/auth", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/attestations", attestationRouter);
app.use("/api/bounty-image", bountyImageRouter);
app.use("/api/bounties", bountyRouter);
app.use("/api/waitlist", waitlistRouter);
if (isDemoMode) {
  app.use("/api/demo/bounties", demoBountiesRouter);
  app.use("/api/demo/attestations", demoAttestationsRouter);
}
// Also handle .svg extension at the app level
app.get("/api/bounty-image.svg", generateBountyImage);

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 AlgoBounty Backend API running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🧪 Demo Mode: ${isDemoMode ? "ENABLED" : "disabled"}`);
});

async function shutdown(signal: NodeJS.Signals) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed");
  });
  await closeMongoConnection();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
