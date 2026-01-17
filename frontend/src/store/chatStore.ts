import { create } from "zustand";

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

  // Actions
  setMessages: (messages: Message[]) => void;
  setChatContacts: (users: User[]) => void;
  setAllContacts: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

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

  setMessages: (messages) => set({ messages }),

  setChatContacts: (users) => set({ chatContacts: users }),

  setAllContacts: (users) => set({ allContacts: users }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  getChatContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to GET /api/v1/messages/chat-contacts
      console.log("Getting chat contacts");

      // Simulated response - replace with actual API call later
      const mockResponse = {
        success: true,
        data: [
          {
            _id: "2",
            username: "Alice",
          },
          {
            _id: "3",
            username: "Bob",
          },
        ],
      };

      set({ chatContacts: mockResponse.data, isLoading: false });
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
      // TODO: Implement API call to GET /api/v1/messages/all-contacts
      console.log("Getting all contacts");

      // Simulated response - replace with actual API call later
      const mockResponse = {
        success: true,
        data: [
          {
            _id: "2",
            username: "Alice",
          },
          {
            _id: "3",
            username: "Bob",
          },
          {
            _id: "4",
            username: "Charlie",
          },
          {
            _id: "5",
            username: "Diana",
          },
          {
            _id: "6",
            username: "Eve",
          },
        ],
      };

      set({ allContacts: mockResponse.data, isLoading: false });
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
      // TODO: Implement API call to GET /api/v1/messages/:id
      console.log("Getting messages for user:", userId);

      // Simulated response - replace with actual API call later
      const mockResponse = {
        success: true,
        data: [
          {
            _id: "1",
            senderId: "1",
            receiverId: userId,
            text: "Hello!",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "2",
            senderId: userId,
            receiverId: "1",
            text: "Hi there!",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      set({ messages: mockResponse.data, isLoading: false });
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
      // TODO: Implement API call to POST /api/v1/messages/send/:id
      console.log("Sending message to:", receiverId, { text, image });

      // Simulated response - replace with actual API call later
      const mockResponse = {
        success: true,
        data: {
          _id: Date.now().toString(),
          senderId: "1", // Current user ID - get from auth store
          receiverId,
          text,
          image,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      // Add message to current messages
      set({
        messages: [...get().messages, mockResponse.data],
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
