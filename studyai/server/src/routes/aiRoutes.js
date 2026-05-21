// src/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const {
  summarize, chat, getSummaries, getSummary, deleteSummary,
  getChats, getChat, deleteChat, generateQuiz, recommend,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Summary routes
router.post("/summarize", summarize);
router.get("/summaries", getSummaries);
router.get("/summaries/:id", getSummary);
router.delete("/summaries/:id", deleteSummary);

// Chat routes
router.post("/chat", chat);
router.get("/chats", getChats);
router.get("/chats/:id", getChat);
router.delete("/chats/:id", deleteChat);

// Other AI routes
router.post("/quiz", generateQuiz);
router.post("/recommend", recommend);

module.exports = router;
