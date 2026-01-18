import { create } from "zustand";
import { socketService } from "../lib/socket";
import type { Message as SocketMessage } from "../types/socket.d";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  username: string;
}

interface ChatState {
  messages: Message[];
  chatContacts: User[]; // Users with message history
  allContacts: User[]; // All available users
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Socket.IO state
  onlineUsers: Set<string>;
  typingUsers: Map<string, boolean>;
  messageDeliveryStatus: Map<string, 'sent' | 'delivered' | 'read'>;

  // Actions
  setMessages: (messages: Message[]) => void;
  setChatContacts: (users: User[]) => void;
  setAllContacts: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Socket.IO actions
  setOnlineUsers: (users: Set<string>) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
  addMessageFromSocket: (message: SocketMessage) => void;
  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
  initializeSocketListeners: () => void;
  cleanupSocketListeners: () => void;

  // API actions
  getChatContacts: () => Promise<void>;
  getAllContacts: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (
    receiverId: string,
    text?: string,
    image?: string
  ) => Promise<void>;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  chatContacts: [],
  allContacts: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  // Socket.IO state
  onlineUsers: new Set<string>(),
  typingUsers: new Map<string, boolean>(),
  messageDeliveryStatus: new Map<string, 'sent' | 'delivered' | 'read'>(),

  setMessages: (messages) => set({ messages }),

  setChatContacts: (users) => set({ chatContacts: users }),

  setAllContacts: (users) => set({ allContacts: users }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Socket.IO actions
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setUserOnline: (userId: string) => {
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    }));
  },

  setUserOffline: (userId: string) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  setTypingUser: (userId: string, isTyping: boolean) => {
    set((state) => {
      const newMap = new Map(state.typingUsers);
      if (isTyping) {
        newMap.set(userId, true);
      } else {
        newMap.delete(userId);
      }
      return { typingUsers: newMap };
    });
  },

  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    set((state) => {
      const newMap = new Map(state.messageDeliveryStatus);
      newMap.set(messageId, status);
      return { messageDeliveryStatus: newMap };
    });
  },

  addMessageFromSocket: (message: SocketMessage) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  initializeSocketListeners: () => {
    // Receive message
    socketService.on('receiveMessage', (message: SocketMessage) => {
      const { selectedUser, messages } = get();

      // Add to messages if conversation is open
      if (selectedUser &&
          (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
        set({ messages: [...messages, message] });
      }

      // Send delivery receipt
      socketService.emit('messageDelivered', { messageId: message._id });
    });

    // User online
    socketService.on('userOnline', (data: { userId: string }) => {
      get().setUserOnline(data.userId);
    });

    // User offline
    socketService.on('userOffline', (data: { userId: string }) => {
      get().setUserOffline(data.userId);
    });

    // Typing status
    socketService.on('typingStatus', (data: { userId: string; isTyping: boolean }) => {
      get().setTypingUser(data.userId, data.isTyping);

      // Auto-clear after 3s
      if (data.isTyping) {
        setTimeout(() => {
          get().setTypingUser(data.userId, false);
        }, 3000);
      }
    });

    // Message delivered
    socketService.on('messageDelivered', (data: { messageId: string }) => {
      get().updateMessageStatus(data.messageId, 'delivered');
    });

    // Message read
    socketService.on('messageRead', (data: { messageId: string }) => {
      get().updateMessageStatus(data.messageId, 'read');
    });
  },

  cleanupSocketListeners: () => {
    socketService.off('receiveMessage');
    socketService.off('userOnline');
    socketService.off('userOffline');
    socketService.off('typingStatus');
    socketService.off('messageDelivered');
    socketService.off('messageRead');
  },

  getChatContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/messages/chat-contacts`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat contacts');
      }

      const data = await response.json();
      set({ chatContacts: data.data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch chat contacts",
        isLoading: false,
      });
    }
  },

  getAllContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/messages/all-contacts`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all contacts');
      }

      const data = await response.json();
      set({ allContacts: data.data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch all contacts",
        isLoading: false,
      });
    }
  },

  getMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/messages/${userId}`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      set({ messages: data.data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch messages",
        isLoading: false,
      });
    }
  },

  sendMessage: async (receiverId: string, text?: string, image?: string) => {
    if (!text && !image) {
      set({ error: "Message must contain text or image" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/messages/send/${receiverId}`, {
        method: 'POST',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, image }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add message to current messages
      set({
        messages: [...get().messages, data.data],
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  clearChat: () => set({ messages: [], selectedUser: null }),
}));
