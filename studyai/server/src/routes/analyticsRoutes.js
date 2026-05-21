// src/routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { getDashboardAnalytics, logFocusSession, getFocusSessions, getInsights } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/dashboard", getDashboardAnalytics);
router.post("/session", logFocusSession);
router.get("/sessions", getFocusSessions);
router.get("/insights", getInsights);

module.exports = router;
