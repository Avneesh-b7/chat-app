import jwt, { type JwtPayload } from "jsonwebtoken";

// Input contract for token verification
type VerifyTokenParams = {
  token: string;
};

// Normalized payload returned after successful verification
type VerifiedTokenPayload = {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
};

// Verifies a JWT issued by this system and returns trusted user claims
// Used by auth middleware to authenticate requests without DB access
export const verifyToken = async (
  params: VerifyTokenParams
): Promise<VerifiedTokenPayload> => {
  console.info("[AUTH] verifyToken invoked");

  const { token } = params;

  // Guard against missing or malformed tokens early
  if (!token || typeof token !== "string") {
    console.warn("[AUTH] Token missing or invalid");
    throw new Error("Authentication token is missing or invalid");
  }

  // JWT secret must be present for cryptographic verification
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("[AUTH] JWT_SECRET not configured");
    throw new Error("Authentication configuration error");
  }

  try {
    // Cryptographically verifies token signature and expiry
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Ensure required claims exist and are trustworthy
    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new Error("Invalid authentication token");
    }

    if (!decoded.email || typeof decoded.email !== "string") {
      throw new Error("Invalid authentication token");
    }

    // Return a normalized payload for downstream middleware/controllers
    return {
      userId: decoded.sub,
      email: decoded.email,
      issuedAt: decoded.iat as number,
      expiresAt: decoded.exp as number,
    };
  } catch (error: any) {
    // Do not leak verification details (expired vs invalid vs tampered)
    console.warn("[AUTH] Token verification failed", {
      message: error?.message,
    });

    throw new Error("Invalid or expired authentication token");
  }
};
