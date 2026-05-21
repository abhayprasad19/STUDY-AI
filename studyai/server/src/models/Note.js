// src/models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: ["pdf", "text"],
      required: true,
    },
    originalFilename: {
      type: String,
      default: null,
    },
    filePath: {
      type: String,
      default: null,
    },
    content: {
      type: String, // Raw extracted text
      default: "",
    },
    contentLength: {
      type: Number,
      default: 0,
    },
    // Chunked content for vector storage
    chunks: [
      {
        text: String,
        index: Number,
        embeddingId: String, // ID in ChromaDB
      },
    ],
    isProcessed: {
      type: Boolean,
      default: false,
    },
    isEmbedded: {
      type: Boolean,
      default: false,
    },
    collectionName: {
      type: String, // ChromaDB collection name
      default: null,
    },
    tags: [{ type: String, trim: true }],
    subject: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
