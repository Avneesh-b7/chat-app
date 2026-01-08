import { Router } from "express";
import { sendMessageController } from "../controllers/messages.controllers.ts";

const messagesRouter = Router();

messagesRouter.post("/send", sendMessageController);

export { messagesRouter };
