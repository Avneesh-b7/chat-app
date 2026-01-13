import { type Request, type Response, type NextFunction } from "express";
import type { ArcjetNodeRequest } from "@arcjet/node";
import { aj } from "../lib/arcjet.js";

// Adapts Express request into Arcjet's required request shape
// Guarantees presence of remoteAddress for strict type safety
const toArcjetRequest = (req: Request): ArcjetNodeRequest => {
  //   const remoteAddress = req.ip || req.socket.remoteAddress || "0.0.0.0";

  const remoteAddress = req.ip || req.socket.remoteAddress;

  if (!remoteAddress) {
    // Throwing an error here will be caught by the middleware's try/catch
    // and result in a "fail closed" 403 response.
    throw new Error("Could not determine remote address for request.");
  }

  return {
    method: req.method,
    url: req.originalUrl || req.url,
    headers: req.headers,
    socket: {
      remoteAddress,
    },
  };
};

// Express middleware that enforces Arcjet protections
// Blocks malicious, abusive, or automated traffic early
export const arcjetMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const decision = await aj.protect(toArcjetRequest(req), { requested: 1 });

    // Allow request if Arcjet permits it
    if (decision.isAllowed()) {
      return next();
    }

    console.warn("[SECURITY] Arcjet blocked request", {
      reason: decision.reason,
      ip: req.ip,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      message: "Request blocked",
    });
  } catch (error: any) {
    console.error("[SECURITY] Arcjet middleware error", {
      message: error?.message,
    });

    // Fail closed: block request if security layer errors
    return res.status(403).json({
      success: false,
      message: "Request blocked",
    });
  }
};
