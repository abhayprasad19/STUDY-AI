// src/controllers/aiController.js

const Note = require("../models/Note");
const Summary = require("../models/Summary");
const { Chat, FocusSession } = require("../models/Chat");
const { generateSummary } = require("../services/ai/summaryService");
const { generateRAGResponse } = require("../services/ai/chatService");
const {
  generateRecommendations,
} = require("../services/ai/recommendationService");
const Task = require("../models/Task");
const logger = require("../utils/logger");

const getUserCollection = (userId) => `user_docs_${userId}`;

const summarize = async (req, res) => {
  try {
    const { noteId, text, title, subject, aiModel = "groq" } = req.body;
    let textToSummarize = text;
    let summaryTitle = title || "Summary";
    let noteRef = null;

    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note)
        return res
          .status(404)
          .json({ success: false, message: "Note not found" });
      if (!note.isProcessed || !note.content)
        return res
          .status(400)
          .json({
            success: false,
            message: "Note is still being processed. Please wait.",
          });
      textToSummarize = note.content;
      summaryTitle = `Summary: ${note.title}`;
      noteRef = note._id;
    }

    if (!textToSummarize || textToSummarize.trim().length < 100) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Text must be at least 100 characters long",
        });
    }

    logger.ai(`Generating summary for user ${req.user._id} using ${aiModel}`);
    const result = await generateSummary(textToSummarize, aiModel);

    const summary = await Summary.create({
      user: req.user._id,
      note: noteRef,
      title: summaryTitle,
      originalText: textToSummarize.substring(0, 5000),
      summary: result.summary,
      keyPoints: result.keyPoints,
      flashcards: result.flashcards,
      quizQuestions: result.quizQuestions,
      aiModel,
      tokensUsed: result.tokensUsed,
      generationTime: result.generationTime,
      subject: subject || "General",
    });

    res.json({ success: true, summary });
  } catch (error) {
    logger.error("Summarize error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to generate summary",
      });
  }
};

const chat = async (req, res) => {
  try {
    const { message, chatId, noteId, aiModel = "groq" } = req.body;

    if (!message || message.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    let chatSession;
    if (chatId) {
      chatSession = await Chat.findOne({ _id: chatId, user: req.user._id });
    }

    if (!chatSession) {
      chatSession = await Chat.create({
        user: req.user._id,
        note: noteId || null,
        title: message.substring(0, 50),
        type: noteId ? "pdf-chat" : "general",
        aiModel,
        messages: [],
      });
    }

    const history = chatSession.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let collectionName = null;
    let noteRef = null;

    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (note) {
        collectionName = getUserCollection(req.user._id.toString());
        noteRef = noteId;
      }
    }

    const result = await generateRAGResponse(
      message,
      history,
      collectionName,
      noteRef,
      aiModel,
    );

    chatSession.messages.push(
      { role: "user", content: message },
      { role: "assistant", content: result.response, sources: result.sources },
    );

    await chatSession.save();

    res.json({
      success: true,
      response: result.response,
      sources: result.sources,
      chatId: chatSession._id,
    });
  } catch (error) {
    logger.error("Chat error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to generate response",
      });
  }
};

const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user._id })
      .select("-originalText")
      .sort("-createdAt")
      .limit(50);
    res.json({ success: true, summaries });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch summaries" });
  }
};

const getSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!summary)
      return res
        .status(404)
        .json({ success: false, message: "Summary not found" });
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get summary" });
  }
};

const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!summary)
      return res
        .status(404)
        .json({ success: false, message: "Summary not found" });
    res.json({ success: true, message: "Summary deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete summary" });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id, isActive: true })
      .select("title type aiModel createdAt updatedAt")
      .sort("-updatedAt")
      .limit(30);
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get chats" });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("note", "title");
    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get chat" });
  }
};

const deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete chat" });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { noteId, text, numQuestions = 5, aiModel = "groq" } = req.body;
    let content = text;

    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note?.content)
        return res
          .status(400)
          .json({ success: false, message: "Note content not found" });
      content = note.content;
    }

    if (!content)
      return res
        .status(400)
        .json({ success: false, message: "Content required" });

    const result = await generateSummary(content, aiModel);
    res.json({ success: true, quizQuestions: result.quizQuestions });
  } catch (error) {
    logger.error("Quiz error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate quiz" });
  }
};

const recommend = async (req, res) => {
  try {
    const userId = req.user._id;
    const aiModel = req.body.aiModel || "groq";
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [recentTasks, focusSessions, user] = await Promise.all([
      Task.find({ user: userId, createdAt: { $gte: weekAgo } })
        .select("title status category")
        .limit(10),
      FocusSession.find({ user: userId, createdAt: { $gte: weekAgo } }),
      require("../models/User").findById(userId).select("stats"),
    ]);

    const completedTasks = recentTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const subjects = [...new Set(recentTasks.map((t) => t.category))];
    const totalStudyTime = focusSessions.reduce(
      (acc, s) => acc + (s.completedDuration || 0),
      0,
    );

    const userData = {
      recentTasks,
      completedTasks,
      pendingTasks: recentTasks.filter((t) => t.status !== "completed").length,
      focusSessions: focusSessions.length,
      totalStudyTime: Math.round(totalStudyTime / 60),
      streak: user?.stats?.streak || 0,
      subjects,
    };

    const recommendations = await generateRecommendations(userData, aiModel);
    res.json({ success: true, recommendations });
  } catch (error) {
    logger.error("Recommend error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate recommendations" });
  }
};

module.exports = {
  summarize,
  chat,
  getSummaries,
  getSummary,
  deleteSummary,
  getChats,
  getChat,
  deleteChat,
  generateQuiz,
  recommend,
};
