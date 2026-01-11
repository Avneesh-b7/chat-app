import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../lib/verifyToken.js";

// Middleware that authenticates requests using JWT stored in cookies
// Blocks unauthenticated access and enriches request with user context
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  console.info("[AUTH] authMiddleware invoked", {
    path: req.path,
    method: req.method,
  });

  // Extract token from HTTP-only cookies (preferred for browser-based auth)
  const token = req.cookies?.auth_token;

  // Reject early if token is missing
  if (!token || typeof token !== "string") {
    console.warn("[AUTH] Missing authentication token", {
      ip: req.ip,
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    // Verify token cryptographically and extract trusted claims
    const verifiedPayload = await verifyToken({ token });

    // Attach authenticated user context to the request
    // Controllers can safely rely on req.user from this point forward
    req.user = {
      id: verifiedPayload.userId,
      email: verifiedPayload.email,
    };

    console.info("[AUTH] Authentication successful", {
      userId: verifiedPayload.userId,
    });

    return next();
  } catch (error: any) {
    // Treat all token failures uniformly to avoid leaking auth details
    console.warn("[AUTH] Authentication failed", {
      message: error?.message,
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
