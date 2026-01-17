import axios from "axios";

// Base URL - update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: sends HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // You can add additional headers or logging here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - could trigger logout or redirect
        console.error("[AUTH] Unauthorized request");
      } else if (status === 403) {
        console.error("[AUTH] Forbidden");
      } else if (status === 429) {
        console.error("[RATE_LIMIT] Too many requests");
      } else if (status >= 500) {
        console.error(
          "[SERVER] Server error:",
          data.message || "Unknown error"
        );
      }

      // Return the error message from backend if available
      const message = data?.message || data?.error || "An error occurred";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response received
      console.error("[NETWORK] No response received");
      return Promise.reject(
        new Error("Network error - please check your connection")
      );
    } else {
      // Error in request setup
      console.error("[REQUEST] Error setting up request:", error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosClient;

//   This client:
//   - Uses environment variable for API URL (defaults to localhost:5000)
//   - Enables withCredentials for cookie-based auth
//   - Has 10-second timeout
//   - Includes error handling for common HTTP status codes (401, 403, 429, 5xx)
//   - Extracts error messages from backend responses
