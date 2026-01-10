import { type Request, type Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "../lib/hashPassword.js";
import { sendEmail } from "../lib/email/sendEmail.js";

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
    console.warn("[AUTH] Register validation failed: missing fields", {
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
    console.warn("[AUTH] Register validation failed: invalid field types", {
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
      console.warn("[AUTH] Registration conflict: user already exists", {
        email,
      });

      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    /* -------------------------- PASSWORD HASHING -------------------------- */
    const { hashedPassword } = await hashPassword({ password });

    /* ----------------------------- USER CREATE ----------------------------- */
    const createdUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    console.info("[AUTH] User created successfully", {
      userId: createdUser._id,
      email,
    });

    /* ----------------------------- SEND EMAIL ----------------------------- */
    // Email failure must NOT fail registration

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Chat App 🎉",
        userName: username,
      });
    } catch (error: any) {
      console.error("[EMAIL] Failed to send welcome email", {
        userId: createdUser._id,
        email,
        message: error?.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error: any) {
    console.error("[AUTH] Failed to register user", {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
}

export async function loginUserController() {}

export async function logoutUserController() {}
