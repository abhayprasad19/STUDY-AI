// src/models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["study", "assignment", "project", "revision", "other"],
      default: "study",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30,
    },
    actualTime: {
      type: Number, // in minutes
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    aiSuggestion: {
      type: String,
      default: null,
    },
    focusScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set completedAt when status changes to completed
taskSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "completed") {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
