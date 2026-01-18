import { Server, Socket } from "socket.io";

export interface ServerToClientEvents {
  receiveMessage: (message: MessagePayload) => void;
  typingStatus: (data: TypingPayload) => void;
  userOnline: (data: { userId: string; timestamp: string }) => void;
  userOffline: (data: { userId: string; timestamp: string }) => void;
  messageDelivered: (data: { messageId: string; userId: string }) => void;
  messageRead: (data: { messageId: string; userId: string }) => void;
  error: (error: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: SendMessagePayload) => void;
  typing: (data: { receiverId: string; isTyping: boolean }) => void;
  messageDelivered: (data: { messageId: string }) => void;
  messageRead: (data: { messageId: string }) => void;
}

export interface SocketData {
  user: {
    id: string;
    email: string;
  };
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

export interface MessagePayload {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// const messagePayload = {
//   _id: newMessage._id.toString(),
//   senderId: newMessage.senderId.toString(),
//   receiverId: newMessage.receiverId.toString(),
//   createdAt: newMessage.createdAt.toISOString(),
//   updatedAt: newMessage.updatedAt.toISOString(),
//   ...(newMessage.text ? { text: newMessage.text } : {}),
//   ...(newMessage.image ? { image: newMessage.image } : {}),
// };

// io.to(receiverSocketId).emit("receiveMessage", messagePayload);

export interface SendMessagePayload {
  receiverId: string;
  text?: string;
  image?: string;
}

export interface TypingPayload {
  userId: string;
  isTyping: boolean;
}
