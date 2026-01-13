import dotenv from "dotenv";

dotenv.config();

// Centralized env validation (fail fast, once)
const requiredEnvVars = [
  "MONGODB_URI",
  "MONGODB_DB_NAME",
  "NODE_ENV",
  "PORT",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "VERIFICATION_CODE_TTL_MINUTES",
  "JWT_SECRET",
  "ARCJET_KEY",
  "ARCJET_ENV",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`[STARTUP] Missing required env var: ${key}`);
  }
}
