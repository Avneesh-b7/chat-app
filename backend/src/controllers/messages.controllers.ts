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

export async function getMessagesByUserId() {}

export async function sendMessage() {}
