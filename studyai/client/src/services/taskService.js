// src/services/taskService.js
import api from "./api";

export const taskService = {
  getTasks: (params) => api.get("/tasks", { params }),
  createTask: (data) => api.post("/tasks", data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getAnalytics: () => api.get("/tasks/analytics"),
};
