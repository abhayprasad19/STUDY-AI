// src/controllers/taskController.js
const Task = require("../models/Task");
const User = require("../models/User");
const logger = require("../utils/logger");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, estimatedTime, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority: priority || "medium",
      category: category || "study",
      dueDate: dueDate || null,
      estimatedTime: estimatedTime || 30,
      tags: tags || [],
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.totalTasks": 1 },
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    logger.error("Create task error:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

// @desc    Get all tasks for the user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, sort = "-createdAt", limit = 50, page = 1 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).limit(parseInt(limit)).skip(skip),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Get tasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const prevStatus = task.status;
    const allowedFields = ["title", "description", "status", "priority", "category", "dueDate", "estimatedTime", "actualTime", "tags", "aiSuggestion", "focusScore"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    // Update user stats when task is completed
    if (prevStatus !== "completed" && task.status === "completed") {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.completedTasks": 1 },
      });
    } else if (prevStatus === "completed" && task.status !== "completed") {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "stats.completedTasks": -1 },
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    logger.error("Update task error:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        "stats.totalTasks": -1,
        ...(task.status === "completed" ? { "stats.completedTasks": -1 } : {}),
      },
    });

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    logger.error("Delete task error:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

// @desc    Get task analytics
// @route   GET /api/tasks/analytics
// @access  Private
const getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalTasks, completedTasks, weeklyTasks, byPriority, byCategory] =
      await Promise.all([
        Task.countDocuments({ user: userId }),
        Task.countDocuments({ user: userId, status: "completed" }),
        Task.find({ user: userId, createdAt: { $gte: weekAgo } }),
        Task.aggregate([
          { $match: { user: userId } },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        Task.aggregate([
          { $match: { user: userId } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      success: true,
      analytics: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        weeklyCount: weeklyTasks.length,
        weeklyCompleted: weeklyTasks.filter((t) => t.status === "completed").length,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    logger.error("Task analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to get analytics" });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getTaskAnalytics };
