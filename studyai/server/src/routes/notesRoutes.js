// src/routes/notesRoutes.js
const express = require("express");
const router = express.Router();
const { uploadNote, getNotes, getNote, deleteNote } = require("../controllers/notesController");
const { protect } = require("../middleware/authMiddleware");
const { handleNoteUpload } = require("../middleware/uploadMiddleware");

router.use(protect);

router.get("/", getNotes);
router.post("/upload", handleNoteUpload, uploadNote);
router.get("/:id", getNote);
router.delete("/:id", deleteNote);

module.exports = router;
