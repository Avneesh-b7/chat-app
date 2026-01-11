import "express";

// Augments the Express Request interface with authenticated user context
// This allows middleware to attach req.user safely across the app
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
