import express, { type Request, type Response } from "express";
import {
  registerUserController,
  loginUserController,
  logoutUserController,
  updateUserController,
  meController,
} from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = express.Router();

// not protected routes
authRouter.post("/register", registerUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/logout", logoutUserController);

// protected routes
authRouter.put("/update-user", authMiddleware, updateUserController);
authRouter.get("/me", authMiddleware, meController);
