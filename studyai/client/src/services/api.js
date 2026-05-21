// src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  timeout: 60000, // 60s for AI calls
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("studyai_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    if (error.response?.status === 401) {
      localStorage.removeItem("studyai_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again.");
    }
    return Promise.reject({ ...error, message });
  }
);

export default api;
