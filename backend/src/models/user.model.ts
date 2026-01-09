import mongoose, { Schema } from "mongoose";

/* ----------------------------- USER SCHEMA ----------------------------- */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email format is invalid"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [60, "Password hash is invalid"],
      select: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

/* -------------------------- SCHEMA SAFETY GUARD -------------------------- */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // Guardrail: raw passwords must never be saved
  if (this.password.length < 60) {
    console.error("[MODEL] Attempted to save unhashed password", {
      userId: this._id,
    });
    throw new Error("Password must be hashed before saving");
  }
});

/* ----------------------------- MODEL INIT ----------------------------- */
mongoose.models.users || mongoose.model("users", userSchema);
