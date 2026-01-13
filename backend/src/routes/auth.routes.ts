import express, { type Request, type Response } from "express";
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  updateUserController,
  meController,
} from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { arcjetMiddleware } from "../middlewares/arcjet.middleware.js";

export const authRouter = express.Router();

// not protected routes
authRouter.post("/register", arcjetMiddleware, registerUserController);
authRouter.post("/login", arcjetMiddleware, loginUserController);

// protected routes
authRouter.put(
  "/update-user",
  arcjetMiddleware,
  authMiddleware,
  updateUserController
);
authRouter.get("/me", arcjetMiddleware, authMiddleware, meController);
authRouter.post(
  "/logout",
  arcjetMiddleware,
  authMiddleware,
  logoutUserController
);
