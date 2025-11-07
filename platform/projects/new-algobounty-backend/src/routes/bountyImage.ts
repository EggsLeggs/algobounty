import { Router, type Request, type Response } from "express";

export const bountyImageRouter = Router();

// Handler function for generating the bounty image
export async function generateBountyImage(req: Request, res: Response) {
  try {
    const { repoId, issue, priceOverride } = req.query;

    // Validate required parameters
    if (!repoId || !issue) {
      return res.status(400).json({ 
        error: "Missing required parameters: repoId and issue are required" 
      });
    }

    // Get the bounty amount (use priceOverride if provided, otherwise default to 0)
    const bountyAmount = priceOverride 
      ? parseFloat(priceOverride as string) 
      : 0;

    // Format the amount with 2 decimal places
    const formattedAmount = bountyAmount.toFixed(2);

    // Generate SVG with colors from main.css
    // Colors: background: #f9f2e9, foreground: #2d2d2d, blue: #7F9ED7
    const width = 240;
    const height = 50;
    const borderRadius = 10;
    const padding = 16;
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="${width}" height="${height}" fill="#f9f2e9" stroke="#2d2d2d" stroke-width="1.5" rx="${borderRadius}"/>
  
  <!-- "Fund this bounty" text (left side) -->
  <text x="${padding}" y="${height / 2}" 
        font-family="Raleway, Arial, sans-serif" 
        font-size="14" 
        font-weight="600" 
        fill="#2d2d2d" 
        text-anchor="start" 
        dominant-baseline="middle">
    Fund this bounty
  </text>
  
  <!-- Amount text (right side) -->
  <text x="${width - padding}" y="${height / 2}" 
        font-family="Raleway, Arial, sans-serif" 
        font-size="16" 
        font-weight="700" 
        fill="#7F9ED7" 
        text-anchor="end" 
        dominant-baseline="middle">
    ${formattedAmount} ALGO
  </text>
</svg>`;

    // Set response headers - allow all origins for image embedding (GitHub needs this)
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Send the SVG
    res.send(svg);
  } catch (error) {
    console.error("Bounty image generation error:", error);
    res.status(500).json({ error: "Failed to generate bounty image" });
  }
}

// Generate bounty image with current amount (as SVG)
bountyImageRouter.get("/", generateBountyImage);

