// src/controllers/notesController.js
const Note = require("../models/Note");
const { extractText } = require("../services/pdf/pdfParser");
const {
  chunkText,
  prepareChunksForEmbedding,
  cleanExtractedText,
} = require("../services/pdf/textExtractor");
const {
  storeChunks,
  deleteNoteChunks,
} = require("../services/vector/chromaStore");
const logger = require("../utils/logger");
const fs = require("fs");

const getUserCollection = (userId) => `user_docs_${userId}`;

const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { title, subject, tags } = req.body;
    const file = req.file;
    const isPDF = file.mimetype === "application/pdf";

    const note = await Note.create({
      user: req.user._id,
      title: title || file.originalname,
      type: isPDF ? "pdf" : "text",
      originalFilename: file.originalname,
      filePath: file.path,
      subject: subject || "General",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      isProcessed: false,
    });

    processNoteAsync(note, file, req.user._id).catch((err) =>
      logger.error("Async note processing failed:", err),
    );

    res.status(201).json({
      success: true,
      message: "File uploaded successfully. Processing in background...",
      note,
    });
  } catch (error) {
    logger.error("Upload note error:", error);
    res.status(500).json({ success: false, message: "Failed to upload note" });
  }
};

const processNoteAsync = async (note, file, userId) => {
  try {
    const { text } = await extractText(file.path, file.mimetype);
    const cleanedText = cleanExtractedText(text);

    note.content = cleanedText;
    note.contentLength = cleanedText.length;
    note.isProcessed = true;
    await note.save();

    const chunks = chunkText(cleanedText, 1000, 200);

    if (chunks.length > 0) {
      const preparedChunks = prepareChunksForEmbedding(
        chunks,
        note._id,
        userId,
      );
      const collectionName = getUserCollection(userId);

      try {
        await storeChunks(collectionName, preparedChunks);
      } catch (e) {
        logger.error("ChromaDB unavailable, skipping embeddings");
      }

      note.isEmbedded = true;
      note.collectionName = getUserCollection(userId);

      note.chunks = chunks.map((text, index) => ({
        text: text.substring(0, 200),
        index,
        embeddingId: `${note._id}-chunk-${index}`,
      }));

      await note.save();
    }

    logger.success(`Note processed: ${note.title} (${chunks.length} chunks)`);
  } catch (error) {
    logger.error("Note processing error:", error);
    note.isProcessed = false;
    await note.save().catch(() => {});
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .select("-content -chunks")
      .sort("-createdAt");
    res.json({ success: true, notes });
  } catch (error) {
    logger.error("Get notes error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notes" });
  }
};

const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get note" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });

    if (note.filePath && fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath);
    }

    if (note.collectionName) {
      try {
        await deleteNoteChunks(note.collectionName, note._id);
      } catch (e) {
        logger.error("Failed to delete ChromaDB chunks");
      }
    }

    await note.deleteOne();
    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    logger.error("Delete note error:", error);
    res.status(500).json({ success: false, message: "Failed to delete note" });
  }
};

module.exports = { uploadNote, getNotes, getNote, deleteNote };
