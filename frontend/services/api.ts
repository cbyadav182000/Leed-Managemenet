import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Configured Axios instance for all API calls.
 * - Base URL from environment variable
 * - JSON content type header
 * - Request/response interceptors for logging and error handling
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000, // 30 second timeout
});

// Request interceptor — log all outgoing requests in development
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize error shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    // Attach clean message for UI consumption
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
