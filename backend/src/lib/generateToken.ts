import jwt, { type SignOptions } from "jsonwebtoken";

/* ----------------------------- TYPES ----------------------------- */
type GenerateTokenParams = {
  userId: string;
  email: string;

  expiresIn: SignOptions["expiresIn"]; //  correct typing
};

type GenerateTokenResult = {
  token: string;
};

/* -------------------------- GENERATE TOKEN -------------------------- */
export const generateToken = async (
  params: GenerateTokenParams
): Promise<GenerateTokenResult> => {
  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[AUTH] generateToken invoked", {
    userId: params?.userId,
  });

  const { userId, email, expiresIn } = params;

  /* ----------------------------- VALIDATION ----------------------------- */
  if (!userId || typeof userId !== "string") {
    console.error("[AUTH] Invalid userId for token generation", { userId });
    throw new Error("Invalid token payload: userId is required");
  }

  if (!email || typeof email !== "string") {
    console.error("[AUTH] Invalid email for token generation", { email });
    throw new Error("Invalid token payload: email is required");
  }

  if (!expiresIn || typeof expiresIn !== "string") {
    console.error("[AUTH] Invalid expiresIn for token generation", {
      expiresIn,
    });
    throw new Error("Invalid token configuration: expiresIn is required");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || typeof jwtSecret !== "string") {
    console.error("[AUTH] Missing JWT_SECRET environment variable");
    throw new Error("Authentication configuration error");
  }

  /* ----------------------------- TOKEN GENERATION ----------------------------- */
  try {
    console.info("[AUTH] Signing JWT");

    const token = jwt.sign(
      {
        sub: userId,
        email,
      },
      jwtSecret,
      {
        expiresIn,
        algorithm: "HS256",
      }
    );

    console.info("[AUTH] JWT generated successfully", {
      userId,
      expiresIn,
    });

    return { token };
  } catch (error: any) {
    console.error("[AUTH] JWT generation failed", {
      message: error?.message,
      stack: error?.stack,
    });

    throw new Error("Failed to generate authentication token");
  }
};
