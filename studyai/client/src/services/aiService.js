// src/services/aiService.js
import api from "./api";

export const aiService = {
  // Notes
  uploadNote: (formData) =>
    api.post("/notes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getNotes: () => api.get("/notes"),
  getNote: (id) => api.get(`/notes/${id}`),
  deleteNote: (id) => api.delete(`/notes/${id}`),

  // Summaries
  summarize: (data) => api.post("/ai/summarize", data),
  getSummaries: () => api.get("/ai/summaries"),
  getSummary: (id) => api.get(`/ai/summaries/${id}`),
  deleteSummary: (id) => api.delete(`/ai/summaries/${id}`),

  // Chat
  chat: (data) => api.post("/ai/chat", data),
  getChats: () => api.get("/ai/chats"),
  getChat: (id) => api.get(`/ai/chats/${id}`),
  deleteChat: (id) => api.delete(`/ai/chats/${id}`),

  // Other
  generateQuiz: (data) => api.post("/ai/quiz", data),
  getRecommendations: (data) => api.post("/ai/recommend", data),
};
