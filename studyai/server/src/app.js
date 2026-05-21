// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
