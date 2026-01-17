import { create } from "zustand";

//   This store includes:
//   - State: user, isAuthenticated, isLoading, error
//   - Actions: login, register, logout, checkAuth, and state setters
//   - Placeholder logic: Ready for API integration later (marked with TODO comments)

interface User {
  id: string;
  email: string;
  username: string;
  profilePic?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to /api/v1/auth/login
      // For now, just placeholder
      console.log("Login:", email, password);

      // Simulated response - replace with actual API call later
      const mockUser: User = {
        id: "1",
        email,
        username: "user",
      };

      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to /api/v1/auth/register
      console.log("Register:", email, username, password);

      // Simulated response - replace with actual API call later
      const mockUser: User = {
        id: "1",
        email,
        username,
      };

      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to /api/v1/auth/logout
      console.log("Logout");

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Logout failed",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call to /api/v1/auth/me
      console.log("Check auth");

      // For now, assume not authenticated
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Auth check failed",
        isLoading: false,
      });
    }
  },
}));
