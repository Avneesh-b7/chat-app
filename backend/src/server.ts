import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectToDatabase } from "./lib/dbconn.js";
import { authRouter } from "./routes/auth.routes.js";
import "./models/user.model.js";

/* -------------------------------- ENV SETUP -------------------------------- */

/* ------------------------------- APP SETUP -------------------------------- */
const app = express();

/* ------------------------------ MIDDLEWARE -------------------------------- */
app.use(express.json());

/* ------------------------------ START SERVER ------------------------------ */
const startServer = async (): Promise<void> => {
  console.info("[STARTUP] Server starting");

  const port = Number(process.env.PORT);
  const environment = process.env.NODE_ENV as
    | "development"
    | "staging"
    | "production";

  //validaition
  if (!port || Number.isNaN(port)) {
    console.error("[STARTUP] Invalid PORT environment variable", {
      PORT: process.env.PORT,
    });
    process.exit(1);
  }

  if (!environment) {
    console.error("[STARTUP] NODE_ENV is missing");
    process.exit(1);
  }

  //connects to db
  try {
    await connectToDatabase({
      appName: "backend-api",
      environment,
    });
  } catch (error: any) {
    console.error("[STARTUP] Database connection failed. Server not started.", {
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  }

  //defining routes
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({ status: "welcome to the home page : status ok" });
  });

  app.use("/api/v1/auth", authRouter);

  //starts finally
  app.listen(port, () => {
    console.info("[SERVER] Express server listening", {
      port,
      environment,
    });
  });
};

/* ------------------------------ EXECUTE -------------------------------- */
startServer().catch((error) => {
  console.error("[STARTUP] Fatal server startup error", {
    message: error?.message,
    stack: error?.stack,
  });
  process.exit(1);
});
