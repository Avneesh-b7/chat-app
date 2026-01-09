import mongoose from "mongoose";

type ConnectToDatabaseParams = {
  appName: string;
  environment: "development" | "staging" | "production";
};

type ConnectToDatabaseResult = {
  connected: boolean;
  host: string;
  database: string;
};

export const connectToDatabase = async (
  params: ConnectToDatabaseParams
): Promise<ConnectToDatabaseResult> => {
  const { appName, environment } = params;

  /* --------------------------------- LOG: ENTRY --------------------------------- */
  console.info("[DB] connectToDatabase invoked", {
    appName,
    environment,
  });

  /* ----------------------------- ENV VAR EXTRACTION ----------------------------- */
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  /* ----------------------------- ENV VAR VALIDATION ----------------------------- */
  if (!mongoUri || typeof mongoUri !== "string") {
    console.error("[DB] Missing or invalid environment variable: MONGODB_URI");
    throw new Error("Configuration error: MONGODB_URI is required");
  }

  if (!dbName || typeof dbName !== "string") {
    console.error(
      "[DB] Missing or invalid environment variable: MONGODB_DB_NAME"
    );
    throw new Error("Configuration error: MONGODB_DB_NAME is required");
  }

  if (!appName || typeof appName !== "string") {
    console.error("[DB] Validation failed: appName is invalid", { appName });
    throw new Error(
      "Invalid configuration: appName must be a non-empty string"
    );
  }

  /* -------------------------- EXISTING CONNECTION CHECK -------------------------- */
  if (mongoose.connection.readyState === 1) {
    console.info("[DB] Existing MongoDB connection detected", {
      //   host: mongoose.connection.host,
      database: mongoose.connection.name,
    });

    return {
      connected: true,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };
  }

  /* ------------------------------- DB CONNECTION ------------------------------- */
  try {
    console.info("[DB] Attempting MongoDB connection", {
      dbName,
    });

    const connection = await mongoose.connect(mongoUri, {
      dbName,
      appName,
      autoIndex: environment !== "production",
      serverSelectionTimeoutMS: 10_000,
    });

    console.info("[DB] MongoDB connected successfully", {
      //   host: connection.connection.host,
      database: connection.connection.name,
      readyState: connection.connection.readyState,
    });

    /* -------------------------- CONNECTION EVENT LOGS -------------------------- */
    mongoose.connection.on("error", (error) => {
      console.error("[DB] MongoDB runtime error", {
        message: error.message,
        stack: error.stack,
      });
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[DB] MongoDB disconnected");
    });

    return {
      connected: true,
      host: connection.connection.host,
      database: connection.connection.name,
    };
  } catch (error: any) {
    console.error("[DB] MongoDB connection failed", {
      message: error?.message,
      stack: error?.stack,
    });

    throw new Error("Failed to connect to MongoDB");
  }
};
