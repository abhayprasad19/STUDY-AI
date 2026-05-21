// src/models/Summary.js
const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
});

const summarySchema = new mongoose.Schema(
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
      required: true,
      trim: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    keyPoints: [{ type: String }],
    flashcards: [flashcardSchema],
    quizQuestions: [quizQuestionSchema],
    aiModel: {
      type: String,
      enum: ["openai", "gemini", "groq"],
      default: "groq",
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    generationTime: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    subject: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Summary", summarySchema);
