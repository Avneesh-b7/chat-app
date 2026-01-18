export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  timestamp: string;
}

export interface MessageReceipt {
  messageId: string;
  userId: string;
}
