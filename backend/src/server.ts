import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes.js";
import { messagesRouter } from "./routes/messages.routes.js";
import "./models/user.model.js";

dotenv.config({ path: "./.env" });

const app = express();

/* ----------------------------- */
/* Global Middleware             */
/* ----------------------------- */
app.use(express.json());

/* ----------------------------- */
/* Routes                        */
/* ----------------------------- */
app.use("api/v1/auth", authRouter);
app.use("api/v1/message", messagesRouter);

/* ----------------------------- */
/* Health Check                  */
/* ----------------------------- */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ----------------------------- */
/* Server Boot                   */
/* ----------------------------- */
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
