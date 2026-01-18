/*
1. create a socket.io server on top of the express server
2. apply authentication middleware (socketAuthMiddleware)
*/

import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import type { TypedServer, TypedSocket } from "../types/socket.d.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";
import {
  addOnlineUser,
  removeOnlineUser,
  getSocketIdByUserId,
  getAllOnlineUserIds,
} from "./socketHelpers.js";

let io: TypedServer;

export function initializeSocketIO(httpServer: HTTPServer): TypedServer {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on("connection", (socket: TypedSocket) => {
    const userId = socket.data.user?.id;
    if (!userId) return;

    console.info("[SOCKET] User connected", { userId, socketId: socket.id });

    // Join user-specific room
    socket.join(userId);

    // Add to online users
    addOnlineUser(userId, socket.id);

    // Broadcast online status
    socket.broadcast.emit("userOnline", {
      userId,
      timestamp: new Date().toISOString(),
    });

    // Event: Send message (real-time only, REST API handles DB)
    socket.on("sendMessage", (data) => {
      const receiverSocketId = getSocketIdByUserId(data.receiverId);
      if (receiverSocketId) {
        // Message will be saved by REST API, just broadcast here
        console.info("[SOCKET] Message event", {
          from: userId,
          to: data.receiverId,
        });
      }
    });

    // Event: Typing indicator
    socket.on("typing", (data) => {
      const receiverSocketId = getSocketIdByUserId(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typingStatus", {
          userId,
          isTyping: data.isTyping,
        });
      }
    });

    // Event: Message delivered
    socket.on("messageDelivered", (data) => {
      const { messageId } = data;
      // Notify sender that message was delivered
      socket.broadcast.emit("messageDelivered", { messageId, userId });
    });

    // Event: Message read
    socket.on("messageRead", (data) => {
      const { messageId } = data;
      // Notify sender that message was read
      socket.broadcast.emit("messageRead", { messageId, userId });
    });

    // Disconnect handler
    socket.on("disconnect", (reason) => {
      console.info("[SOCKET] User disconnected", {
        userId,
        socketId: socket.id,
        reason,
      });

      // Remove from online users
      removeOnlineUser(userId);

      // Broadcast offline status
      socket.broadcast.emit("userOffline", {
        userId,
        timestamp: new Date().toISOString(),
      });
    });
  });

  console.info("[SOCKET] Socket.IO initialized");
  return io;
}

// Export singleton instance getter
export function getIO(): TypedServer {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initializeSocketIO first.",
    );
  }
  return io;
}

// Export helpers
export { getSocketIdByUserId, getAllOnlineUserIds };
