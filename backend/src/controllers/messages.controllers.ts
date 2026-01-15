import { type Request, type Response } from "express";
import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import MessageModel from "../models/message.model.js";

/**
 * GET /messages/all-contacts
 */
export async function getAllContacts(req: Request, res: Response) {
  const requestId = crypto.randomUUID(); // done so that all logs can be grouped togeather as every req id is unique
  //  UUID is Universally Unique Identifier

  console.info("[getAllContacts] Function entry", {
    requestId,
  });

  try {
    const currentUserId = req.user?.id;

    /* ----------------------------- VALIDATION ----------------------------- */
    if (!currentUserId) {
      console.warn("[getAllContacts] Missing authenticated user", {
        requestId,
      });

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      console.warn("[getAllContacts] Invalid userId format", {
        requestId,
        currentUserId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid user identifier",
      });
    }

    console.info("[getAllContacts] Fetching contacts", {
      requestId,
      currentUserId,
    });

    /* ----------------------------- DB QUERY ----------------------------- */
    const contacts = await UserModel.find(
      { _id: { $ne: currentUserId } },
      {
        password: 0,
        email: 0,
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    console.info("[getAllContacts] Contacts fetched successfully", {
      requestId,
      count: contacts.length,
    });

    /* ----------------------------- RESPONSE ----------------------------- */
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("[getAllContacts] Failed to fetch contacts", {
      requestId,
      error,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
}

/**
 * GET /messages/chat-contacts
 */
export async function getChatContacts(req: Request, res: Response) {
  const requestId = crypto.randomUUID();

  console.info("[getChatContacts] Function entry", { requestId });

  try {
    const currentUserId = req.user?.id;

    /* ----------------------------- VALIDATION ----------------------------- */
    if (!currentUserId) {
      console.warn("[getChatContacts] Missing authenticated user", {
        requestId,
      });

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      console.warn("[getChatContacts] Invalid userId format", {
        requestId,
        currentUserId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid user identifier",
      });
    }

    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    console.info("[getChatContacts] Fetching chat contacts", {
      requestId,
      currentUserId,
    });

    /* ----------------------------- AGGREGATION ----------------------------- */
    const chatUserIds = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserObjectId },
            { receiverId: currentUserObjectId },
          ],
        },
      },

      {
        $project: {
          contactUserId: {
            $cond: [
              { $eq: ["$senderId", currentUserObjectId] },
              "$receiverId",
              "$senderId",
            ],
          },
        },
      },

      {
        $group: {
          _id: "$contactUserId",
        },
      },
    ]);

    const contactIds = chatUserIds.map((item) => item._id);

    console.info("[getChatContacts] Unique chat contacts derived", {
      requestId,
      count: contactIds.length,
    });

    if (contactIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    /* ----------------------------- USER FETCH ----------------------------- */
    const contacts = await UserModel.find(
      { _id: { $in: contactIds } },
      { password: 0, email: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();

    console.info("[getChatContacts] Chat contacts fetched successfully", {
      requestId,
      count: contacts.length,
    });

    /* ----------------------------- RESPONSE ----------------------------- */
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("[getChatContacts] Failed to fetch chat contacts", {
      requestId,
      error,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat contacts",
    });
  }
}

/**
 * GET /messages/:id
 * Fetches all messages between the current user and another user
 *
//   input
 * - req.user.id: string (from auth middleware - current logged in user)
 * - req.params.id: string (the other user's ID to fetch conversation with)
 *
//   output
 * Success (200):
 * {
 *   success: true,
 *   data: [
 *     {
 *       _id: "ObjectId",
 *       senderId: "ObjectId",
 *       receiverId: "ObjectId",
 *       text?: "message content",
 *       image?: "image url",
 *       createdAt: "ISO date",
 *       updatedAt: "ISO date"
 *     }
 *   ]
 * }
 *
 * Error (401/400/500):
 * { success: false, message: "error description" }
 */
export async function getMessagesByUserId(req: Request, res: Response) {
  const requestId = crypto.randomUUID();

  console.info("[getMessagesByUserId] Function entry", { requestId });

  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.id;

    /* ----------------------------- VALIDATION ----------------------------- */
    if (!currentUserId) {
      console.warn("[getMessagesByUserId] Missing authenticated user", {
        requestId,
      });

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!otherUserId) {
      console.warn("[getMessagesByUserId] Missing user id parameter", {
        requestId,
      });

      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      console.warn("[getMessagesByUserId] Invalid currentUserId format", {
        requestId,
        currentUserId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid user identifier",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      console.warn("[getMessagesByUserId] Invalid otherUserId format", {
        requestId,
        otherUserId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid user identifier",
      });
    }

    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    console.info("[getMessagesByUserId] Fetching messages", {
      requestId,
      currentUserId,
      otherUserId,
    });

    /* ----------------------------- DB QUERY ----------------------------- */
    const messages = await MessageModel.find({
      $or: [
        { senderId: currentUserObjectId, receiverId: otherUserObjectId },
        { senderId: otherUserObjectId, receiverId: currentUserObjectId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    console.info("[getMessagesByUserId] Messages fetched successfully", {
      requestId,
      count: messages.length,
    });

    /* ----------------------------- RESPONSE ----------------------------- */
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("[getMessagesByUserId] Failed to fetch messages", {
      requestId,
      error,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}

/**
 * POST /messages/send/:id
 * Sends a message from the current user to another user
 *
 * USAGE:
 * POST /messages/send/507f1f77bcf86cd799439011
 * Headers: Authorization: Bearer <token>
 * Body: { "text": "Hello there!" }
 * OR
 * Body: { "image": "https://example.com/image.jpg" }
 * OR
 * Body: { "text": "Check this out", "image": "https://example.com/image.jpg" }
 *
 * INPUT:
 * - req.user.id: string (from auth middleware - current logged in user/sender)
 * - req.params.id: string (the receiver's user ID)
 * - req.body.text?: string (optional message text, max 2000 chars)
 * - req.body.image?: string (optional image URL)
 * - NOTE: At least one of text or image is required
 *
 * OUTPUT:
 * Success (201):
 * {
 *   success: true,
 *   data: {
 *     _id: "ObjectId",
 *     senderId: "ObjectId",
 *     receiverId: "ObjectId",
 *     text?: "message content",
 *     image?: "image url",
 *     createdAt: "ISO date",
 *     updatedAt: "ISO date"
 *   }
 * }
 *
 * Error (401/400/404/500):
 * { success: false, message: "error description" }
 */
export async function sendMessage(req: Request, res: Response) {
  const requestId = crypto.randomUUID();

  console.info("[sendMessage] Function entry", { requestId });

  try {
    const senderId = req.user?.id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    /* ----------------------------- VALIDATION ----------------------------- */
    if (!senderId) {
      console.warn("[sendMessage] Missing authenticated user", {
        requestId,
      });

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!receiverId) {
      console.warn("[sendMessage] Missing receiver id parameter", {
        requestId,
      });

      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (!text && !image) {
      console.warn("[sendMessage] Missing message content", {
        requestId,
      });

      return res.status(400).json({
        success: false,
        message: "Message must contain either text or an image",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.warn("[sendMessage] Invalid senderId format", {
        requestId,
        senderId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid sender identifier",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      console.warn("[sendMessage] Invalid receiverId format", {
        requestId,
        receiverId,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid receiver identifier",
      });
    }

    // Check if receiver exists
    const receiverExists = await UserModel.exists({ _id: receiverId });
    if (!receiverExists) {
      console.warn("[sendMessage] Receiver not found", {
        requestId,
        receiverId,
      });

      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    console.info("[sendMessage] Creating message", {
      requestId,
      senderId,
      receiverId,
      hasText: !!text,
      hasImage: !!image,
    });

    /* ----------------------------- DB OPERATION ----------------------------- */
    const newMessage = await MessageModel.create({
      senderId,
      receiverId,
      text,
      image,
    });

    console.info("[sendMessage] Message created successfully", {
      requestId,
      messageId: newMessage._id,
    });

    /* ----------------------------- RESPONSE ----------------------------- */
    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("[sendMessage] Failed to send message", {
      requestId,
      error,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
}
