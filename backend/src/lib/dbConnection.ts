import mongoose from "mongoose";

async function dbConnect(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  console.info("[DB][CONNECT] Attempting database connection");

  if (!mongoUri) {
    throw new Error("Database connection failed: MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    console.info("[DB][CONNECT] MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: false,
      serverSelectionTimeoutMS: 10_000,
    } as mongoose.ConnectOptions);

    console.info("[DB][CONNECT] MongoDB connected successfully");
  } catch (error) {
    console.error("[DB][CONNECT] MongoDB connection error", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

export { dbConnect };
