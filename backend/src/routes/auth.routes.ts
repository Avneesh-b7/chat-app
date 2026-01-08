import { Router } from "express";
import {
  signupController,
  loginController,
} from "../controllers/auth.controllers.ts";

const authRouter = Router();

authRouter.get("/signup", signupController);
authRouter.post("/login", loginController);

export { authRouter };
