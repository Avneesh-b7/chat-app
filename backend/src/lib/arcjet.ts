import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// Validate Arcjet configuration at module load time
// Security services must fail fast if misconfigured
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error(
    "[STARTUP] ARCJET_KEY is missing. Arcjet cannot be initialized."
  );
}

export const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: arcjetKey,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
        "POSTMAN",
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 3, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 3, // Bucket capacity of 10 tokens
    }),
  ],
});
