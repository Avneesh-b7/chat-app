import express, { type Request, type Response } from "express";
import {
  getAllContacts,
  getChatContacts,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/messages.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const messagesRouter = express.Router();

// all are protected routes
messagesRouter.get("/all-contacts", authMiddleware, getAllContacts);
messagesRouter.get("/chat-contacts", authMiddleware, getChatContacts);
messagesRouter.get("/:id", authMiddleware, getMessagesByUserId);

messagesRouter.post("/send/:id", authMiddleware, sendMessage);
