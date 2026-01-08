import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/**
 * POST /auth/v1/signup
 */
const signupController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.info("[AUTH][SIGNUP] Controller invoked");

  try {
    const { email, username, password } = req.body ?? {};

    console.info("[AUTH][SIGNUP] Incoming payload", {
      email,
      username,
      passwordProvided: Boolean(password),
    });

    /* ----------------------------- */
    /* Validation                    */
    /* ----------------------------- */
    if (!email || typeof email !== "string") {
      console.warn("[AUTH][SIGNUP] Validation failed: invalid email");
      return res.status(400).json({
        success: false,
        message: "Email is required and must be a valid string",
      });
    }

    if (!username || typeof username !== "string") {
      console.warn("[AUTH][SIGNUP] Validation failed: invalid username");
      return res.status(400).json({
        success: false,
        message: "Username is required and must be a valid string",
      });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      console.warn("[AUTH][SIGNUP] Validation failed: weak password");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    /* ----------------------------- */
    /* DB Checks                     */
    /* ----------------------------- */
    const UserModel = mongoose.model("users");

    console.info("[AUTH][SIGNUP] Checking if user already exists");

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (existingUser) {
      console.warn("[AUTH][SIGNUP] User already exists", {
        email,
        username,
      });
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    /* ----------------------------- */
    /* Password Hashing              */
    /* ----------------------------- */
    console.info("[AUTH][SIGNUP] Hashing password");

    const hashedPassword = await bcrypt.hash(password, 12);

    /* ----------------------------- */
    /* User Creation                 */
    /* ----------------------------- */
    console.info("[AUTH][SIGNUP] Creating user");

    const newUser = await UserModel.create({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.info("[AUTH][SIGNUP] User created successfully", {
      userId: newUser._id,
    });

    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    console.error("[AUTH][SIGNUP] Unexpected error", {
      errorMessage: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  }
};

function loginController() {}

export { signupController, loginController };
