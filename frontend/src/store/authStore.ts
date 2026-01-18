import { create } from "zustand";

//   This store includes:
//   - State: user, isAuthenticated, isLoading, error
//   - Actions: login, register, logout, checkAuth, and state setters
//   - Placeholder logic: Ready for API integration later (marked with TODO comments)

interface User {
  _id: string; // Using _id to match MongoDB convention
  id: string; // Keep for backward compatibility
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include', // Send/receive cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Map backend user to frontend user format
      const user: User = {
        _id: data.user.id,
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
      };

      set({ user, isAuthenticated: true, isLoading: false });
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Step 1: Register the user
      const registerResponse = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // Step 2: Automatically login after successful registration
      const loginResponse = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Registration succeeded but login failed. Please login manually.');
      }

      // Map backend user to frontend user format
      const user: User = {
        _id: loginData.user.id,
        id: loginData.user.id,
        email: loginData.user.email,
        username: loginData.user.username,
      };

      set({ user, isAuthenticated: true, isLoading: false });
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Always clear user state, even if API call fails (API always returns success)
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      // Clear user state even on error to ensure client can logout
      set({
        user: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Logout failed",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Not authenticated (401) or user not found (404)
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const data = await response.json();

      // Map backend user to frontend user format
      const user: User = {
        _id: data.user.id,
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
      };

      set({ user, isAuthenticated: true, isLoading: false });
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
