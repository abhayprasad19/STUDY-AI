// src/routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getTaskAnalytics } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All task routes require authentication

router.route("/").get(getTasks).post(createTask);
router.route("/analytics").get(getTaskAnalytics);
router.route("/:id").put(updateTask).delete(deleteTask);

module.exports = router;
