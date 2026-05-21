// src/controllers/analyticsController.js
const Task = require("../models/Task");
const { FocusSession } = require("../models/Chat");
const Note = require("../models/Note");
const Summary = require("../models/Summary");
const { generateProductivityInsights } = require("../services/ai/productivityInsights");
const logger = require("../utils/logger");

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalTasks,
      completedTasks,
      weekTasks,
      weekSessions,
      totalNotes,
      totalSummaries,
      recentSessions,
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "completed" }),
      Task.find({ user: userId, createdAt: { $gte: weekAgo } }),
      FocusSession.find({ user: userId, createdAt: { $gte: weekAgo } }),
      Note.countDocuments({ user: userId }),
      Summary.countDocuments({ user: userId }),
      FocusSession.find({ user: userId, createdAt: { $gte: weekAgo } })
        .sort("-createdAt")
        .limit(10),
    ]);

    // Calculate weekly study hours per day
    const dailyHours = {};
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().split("T")[0];
      dailyHours[dayKey] = 0;
    }

    weekSessions.forEach((session) => {
      const dayKey = session.createdAt.toISOString().split("T")[0];
      if (dailyHours[dayKey] !== undefined) {
        dailyHours[dayKey] += (session.completedDuration || 0) / 3600; // Convert to hours
      }
    });

    const totalStudySeconds = weekSessions.reduce((acc, s) => acc + (s.completedDuration || 0), 0);
    const avgFocusScore =
      weekSessions.length > 0
        ? weekSessions.reduce((acc, s) => acc + (s.focusScore || 70), 0) / weekSessions.length
        : 0;

    // Find most productive day
    const maxDay = Object.entries(dailyHours).reduce(
      (max, [day, hours]) => (hours > max.hours ? { day, hours } : max),
      { day: "N/A", hours: 0 }
    );

    res.json({
      success: true,
      analytics: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalNotes,
          totalSummaries,
          weeklyStudyHours: Math.round((totalStudySeconds / 3600) * 10) / 10,
          weeklySessions: weekSessions.length,
          avgFocusScore: Math.round(avgFocusScore),
        },
        charts: {
          dailyStudyHours: Object.entries(dailyHours).map(([date, hours]) => ({
            date,
            hours: Math.round(hours * 10) / 10,
          })),
          weekTaskCompletion: {
            completed: weekTasks.filter((t) => t.status === "completed").length,
            total: weekTasks.length,
          },
        },
        recentSessions: recentSessions.map((s) => ({
          _id: s._id,
          type: s.type,
          duration: s.duration,
          completedDuration: s.completedDuration,
          isCompleted: s.isCompleted,
          startedAt: s.startedAt,
          focusScore: s.focusScore,
        })),
        mostProductiveDay: maxDay.day,
      },
    });
  } catch (error) {
    logger.error("Dashboard analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to get analytics" });
  }
};

// @desc    Log a completed focus session
// @route   POST /api/analytics/session
// @access  Private
const logFocusSession = async (req, res) => {
  try {
    const { type, duration, completedDuration, isCompleted, taskId, focusScore, notes } = req.body;

    const session = await FocusSession.create({
      user: req.user._id,
      type: type || "focus",
      duration: duration || 1500,
      completedDuration: completedDuration || 0,
      isCompleted: isCompleted || false,
      task: taskId || null,
      focusScore: focusScore || null,
      notes: notes || "",
      completedAt: isCompleted ? new Date() : null,
    });

    // Update user stats if focus session completed
    if (isCompleted && type === "focus") {
      const User = require("../models/User");
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          "stats.totalSessions": 1,
          "stats.totalStudyTime": Math.round((completedDuration || duration) / 60),
        },
      });
    }

    res.status(201).json({ success: true, session });
  } catch (error) {
    logger.error("Log session error:", error);
    res.status(500).json({ success: false, message: "Failed to log session" });
  }
};

// @desc    Get focus session history
// @route   GET /api/analytics/sessions
// @access  Private
const getFocusSessions = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await FocusSession.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip(skip)
      .populate("task", "title");

    const total = await FocusSession.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      sessions,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get sessions" });
  }
};

// @desc    Get AI productivity insights
// @route   GET /api/analytics/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [weekTasks, weekSessions] = await Promise.all([
      Task.find({ user: userId, createdAt: { $gte: weekAgo } }),
      FocusSession.find({ user: userId, createdAt: { $gte: weekAgo } }),
    ]);

    const now = new Date();
    const dailyHours = {};
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      dailyHours[day.toLocaleDateString("en-US", { weekday: "short" })] = 0;
    }

    weekSessions.forEach((s) => {
      const dayName = s.createdAt.toLocaleDateString("en-US", { weekday: "short" });
      if (dailyHours[dayName] !== undefined) {
        dailyHours[dayName] += (s.completedDuration || 0) / 3600;
      }
    });

    const analyticsData = {
      dailyHours,
      completionRate: weekTasks.length
        ? Math.round((weekTasks.filter((t) => t.status === "completed").length / weekTasks.length) * 100)
        : 0,
      avgFocusScore: weekSessions.length
        ? Math.round(weekSessions.reduce((a, s) => a + (s.focusScore || 70), 0) / weekSessions.length)
        : 0,
      totalSessions: weekSessions.length,
      mostProductiveDay: Object.entries(dailyHours).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A",
      subjects: [...new Set(weekTasks.map((t) => t.category))],
    };

    const insights = await generateProductivityInsights(analyticsData);
    res.json({ success: true, insights });
  } catch (error) {
    logger.error("Get insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get insights" });
  }
};

module.exports = { getDashboardAnalytics, logFocusSession, getFocusSessions, getInsights };
