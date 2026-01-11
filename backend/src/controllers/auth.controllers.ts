import { type Request, type Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "../lib/hashPassword.js";
import { sendEmail } from "../lib/email/sendEmail.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/generateToken.js";

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

/*
lets write the login controller 

#TASK 
1. i want you to complete this function export async function loginUserController() {}
- this cheks the user email and then passwrod 
- if valid returns a token (and returns in an http cookie) and non sensitive user details
- if invalid - says incorrect credentials (i dont want the user to know if pass was incorrect or email)
- optimize the code for best practises and use the guidelines for functions that i sent you earlier
- ensure production grade and scalibility and industry best practises


#additional context
2. this is in the file /src/controllers/auth.controllers.ts
*/

export async function loginUserController(
  req: Request,
  res: Response
): Promise<Response> {
  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[AUTH] loginUserController invoked", {
    ip: req.ip,
  });

  /* ----------------------------- VALIDATION ----------------------------- */
  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("[AUTH] Login validation failed: missing fields", { email });

    return res.status(400).json({
      success: false,
      message: "email and password are required",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    console.warn("[AUTH] Login validation failed: invalid field types", {
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

    console.info("[AUTH] Fetching user for login", { email });

    const user = await UserModel.findOne({ email }).select("+password");

    /**
     * IMPORTANT:
     * - Same error for email-not-found and password-invalid
     * - Prevents user enumeration attacks
     */
    if (!user) {
      console.warn("[AUTH] Login failed: invalid credentials", { email });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* -------------------------- PASSWORD CHECK -------------------------- */
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.warn("[AUTH] Login failed: invalid credentials", {
        userId: user._id,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ----------------------------- TOKEN ----------------------------- */
    const { token } = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      expiresIn: "10m",
    });

    /* ----------------------------- RESPONSE USER ----------------------------- */
    const responseUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    console.info("[AUTH] Login successful", {
      userId: user._id,
    });
    /* ----------------------------- COOKIE & RESPONSE ----------------------------- */
    return res
      .status(200)
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 10 * 60 * 1000, // 10 minutes
      })
      .json({
        success: true,
        message: "Login successful",
        user: responseUser,
      });
  } catch (error: any) {
    console.error("[AUTH] Login failed", {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}

/* -------------------------- LOGOUT USER CONTROLLER ----------- */
export async function logoutUserController(
  _req: Request,
  res: Response
): Promise<Response> {
  /* ----------------------------- LOG: ENTRY ----------------------------- */
  console.info("[AUTH] logoutUserController invoked");

  try {
    /* ----------------------------- CLEAR COOKIE ----------------------------- */
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // must match cookie path used during login
    });

    console.info("[AUTH] User logged out successfully");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    /**
     * Logout should never really fail.
     * Even if something unexpected happens, return success.
     */
    console.error("[AUTH] Logout encountered an unexpected error", {
      message: error?.message,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

/*
on now lets say i want to give the user the functionality to update his username and password

#TASK
1. how should i implement this updateUserController() function
2. how to make it according to industry best practises
3. follow guidelines as i have given above
*/

// Updates authenticated user's username and/or password
// Password updates invalidate the current authentication session
export async function updateUserController(
  req: Request,
  res: Response
): Promise<Response> {
  console.info("[USER] updateUserController invoked", {
    userId: req.user?.id,
  });

  // Auth middleware guarantees req.user, this is a defensive guard
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { username, password } = req.body;

  // Reject requests that attempt no actual updates
  if (!username && !password) {
    console.warn("[USER] Update failed: no fields provided", {
      userId: req.user.id,
    });

    return res.status(400).json({
      success: false,
      message: "At least one field must be updated",
    });
  }

  // Validate input types early to avoid unsafe updates
  if (
    (username && typeof username !== "string") ||
    (password && typeof password !== "string")
  ) {
    console.warn("[USER] Update failed: invalid field types", {
      userId: req.user.id,
    });

    return res.status(400).json({
      success: false,
      message: "Invalid request payload",
    });
  }

  try {
    const UserModel = mongoose.model("users");
    const updatePayload: Record<string, any> = {};
    const isPasswordUpdated = Boolean(password);

    // Prepare username update if provided
    if (username) {
      updatePayload.username = username.trim();
    }

    // Prepare password update with hashing
    if (password) {
      const { hashedPassword } = await hashPassword({ password });
      updatePayload.password = hashedPassword;
    }

    // Apply atomic update scoped to authenticated user
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updatedUser) {
      console.error("[USER] Update failed: user not found", {
        userId: req.user.id,
      });

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Invalidate auth session if password was changed
    if (isPasswordUpdated) {
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      console.info("[USER] Password updated, session invalidated", {
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Password updated. Please login again.",
      });
    }

    console.info("[USER] User updated successfully", {
      userId: req.user.id,
      fieldsUpdated: Object.keys(updatePayload),
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("[USER] Failed to update user", {
      userId: req.user?.id,
      message: error?.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
}

// Returns the currently authenticated user's profile
// Relies on auth middleware to populate req.user
export async function meController(
  req: Request,
  res: Response
): Promise<Response> {
  console.info("[AUTH] meController invoked", {
    userId: req.user?.id,
  });

  // Auth middleware guarantees req.user; this is a defensive guard
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const UserModel = mongoose.model("users");

    // Fetch fresh user data to avoid relying on stale token claims
    type LeanUser = {
      _id: string;
      username: string;
      email: string;
    };

    const user = await UserModel.findById(req.user.id)
      .select("_id username email")
      .lean<LeanUser>();

    if (!user) {
      console.error("[AUTH] Authenticated user not found", {
        userId: req.user.id,
      });

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.info("[AUTH] Current user fetched successfully", {
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("[AUTH] Failed to fetch current user", {
      userId: req.user?.id,
      message: error?.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
}
