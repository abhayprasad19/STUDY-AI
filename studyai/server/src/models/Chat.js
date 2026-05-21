// src/models/Chat.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: [
    {
      text: String,
      score: Number,
      chunkIndex: Number,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: null,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    messages: [messageSchema],
    type: {
      type: String,
      enum: ["pdf-chat", "general"],
      default: "general",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    aiModel: {
      type: String,
      enum: ["openai", "gemini", "groq"],
      default: "groq",
    },
  },
  {
    timestamps: true,
  },
);

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["focus", "short-break", "long-break"],
      default: "focus",
    },
    duration: {
      type: Number,
      required: true,
    },
    completedDuration: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    focusScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Chat = mongoose.model("Chat", chatSchema);
const FocusSession = mongoose.model("FocusSession", focusSessionSchema);

module.exports = { Chat, FocusSession };
