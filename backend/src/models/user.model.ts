import mongoose, { Schema } from "mongoose";

/**
 * User Schema
 * Basic version for early-stage project
 */
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // prevents password from being returned by default
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

/* ----------------------------- */
/* Indexes                       */
/* ----------------------------- */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

/* ----------------------------- */
/* Model Registration            */
/* ----------------------------- */
mongoose.models.users || mongoose.model("users", UserSchema);
