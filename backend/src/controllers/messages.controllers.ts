import type { Request, Response } from "express";

const sendMessageController = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Hello, you are on the send message route",
  });
};

export { sendMessageController };
