// src/middleware/uploadMiddleware.js
const { uploadPDF, uploadNote } = require("../config/multer");

// Middleware for PDF upload (single file)
const handlePDFUpload = (req, res, next) => {
  const upload = uploadPDF.single("pdf");
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
};

// Middleware for note upload (single file, PDF or text)
const handleNoteUpload = (req, res, next) => {
  const upload = uploadNote.single("file");
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
};

module.exports = { handlePDFUpload, handleNoteUpload };
