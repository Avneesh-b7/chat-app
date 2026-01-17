import express, { type Request, type Response } from "express";
import {
  getAllContacts,
  getChatContacts,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/messages.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { arcjetMiddleware } from "../middlewares/arcjet.middleware.js";

export const messagesRouter = express.Router();

messagesRouter.use(arcjetMiddleware, authMiddleware);

// all are protected routes
messagesRouter.get("/all-contacts", getAllContacts);
messagesRouter.get("/chat-contacts", getChatContacts);
messagesRouter.get("/:id", getMessagesByUserId);
messagesRouter.post("/send/:id", sendMessage);
