import { type Request, type Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "../lib/hashPassword.js";

/* -------------------------- REGISTER USER CONTROLLER -------------------------- */
export async function registerUserController(
  req: Request,
  res: Response
): Promise<Response> {
  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[AUTH] registerUserController invoked", {
    ip: req.ip,
  });

  /* ----------------------------- VALIDATION ----------------------------- */
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.warn("[AUTH] Register validation failed", {
      username,
      email,
    });

    return res.status(400).json({
      success: false,
      message: "username, email, and password are required",
    });
  }

  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    console.warn("[AUTH] Register validation failed: invalid types", {
      usernameType: typeof username,
      emailType: typeof email,
    });

    return res.status(400).json({
      success: false,
      message: "Invalid request payload",
    });
  }

  /* ----------------------------- DB ACCESS ----------------------------- */
  try {
    const UserModel = mongoose.model("users");

    console.info("[AUTH] Checking if user already exists", { email });

    const existingUser = await UserModel.findOne({ email }).lean();

    if (existingUser) {
      console.warn("[AUTH] User already exists", { email });

      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    /* -------------------------- PASSWORD HASHING -------------------------- */
    const { hashedPassword } = await hashPassword({ password });
    /* ----------------------------- USER CREATE ----------------------------- */
    await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // TODO: send a welcome email to users

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error: any) {
    console.error("[AUTH] Failed to register user", {
      message: error?.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
}

export async function loginUserController() {}

export async function logoutUserController() {}
