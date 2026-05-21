// src/services/analyticsService.js
import api from "./api";

export const analyticsService = {
  getDashboard: () => api.get("/analytics/dashboard"),
  logSession: (data) => api.post("/analytics/session", data),
  getSessions: (params) => api.get("/analytics/sessions", { params }),
  getInsights: () => api.get("/analytics/insights"),
};
