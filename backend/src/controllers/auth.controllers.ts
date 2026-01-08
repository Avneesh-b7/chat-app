import type { Request, Response } from "express";

const signupController = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Hello, you are on the signup route",
  });
};

function loginController() {}

export { signupController, loginController };
