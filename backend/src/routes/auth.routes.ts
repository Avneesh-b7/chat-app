import express, { type Request, type Response } from "express";
import {
  registerUserController,
  loginUserController,
  logoutUserController,
} from "../controllers/auth.controllers.js";

export const authRouter = express.Router();

authRouter.post("/register", registerUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/logout", logoutUserController);
