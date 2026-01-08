/*
//PROMPT

file : ./src/lib/tokenGenerator.ts

pseudo code -->
async function generateJWT(userid, email) {
returns token
}


*/

import jwt from "jsonwebtoken";

/**
 * Generates a JWT token for an authenticated user
 */
async function generateJWT(userId: string, email: string): Promise<string> {
  console.info("[AUTH][JWT] Token generation started", {
    userId,
    email,
  });

  /* ----------------------------- */
  /* Validation                    */
  /* ----------------------------- */
  if (!userId || typeof userId !== "string") {
    console.error("[AUTH][JWT] Invalid userId");
    throw new Error("JWT generation failed: invalid userId");
  }

  if (!email || typeof email !== "string") {
    console.error("[AUTH][JWT] Invalid email");
    throw new Error("JWT generation failed: invalid email");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("[AUTH][JWT] Missing JWT_SECRET");
    throw new Error("JWT generation failed: JWT_SECRET not configured");
  }

  /* ----------------------------- */
  /* Token Generation              */
  /* ----------------------------- */
  const payload = {
    sub: userId,
    email,
  };

  try {
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "7d",
    });

    console.info("[AUTH][JWT] Token generated successfully", {
      userId,
    });

    return token;
  } catch (error: any) {
    console.error("[AUTH][JWT] Token generation error", {
      errorMessage: error?.message,
      stack: error?.stack,
    });

    throw new Error("JWT generation failed");
  }
}
