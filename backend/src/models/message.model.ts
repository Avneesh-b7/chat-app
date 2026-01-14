import mongoose, { Schema, Types } from "mongoose";

/* ----------------------------- MESSAGE INTERFACE ----------------------------- */
export interface IMessage {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------ MESSAGE SCHEMA ------------------------------ */
const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Sender ID is required"],
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Receiver ID is required"],
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Message text cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

/* -------------------------- SCHEMA SAFETY GUARD -------------------------- */
// Enforces that a message must contain either text or an image
messageSchema.pre("validate", function () {
  if (!this.text && !this.image) {
    this.invalidate("text", "Message must contain either text or an image");
  }
});

/* ----------------------------- MODEL INIT ----------------------------- */
const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;
