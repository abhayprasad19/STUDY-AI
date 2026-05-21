// src/config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// PDF storage configuration
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/pdfs");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `pdf-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Notes storage configuration
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/notes");
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `note-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// File filter for text/pdf files
const notesFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "text/plain", "text/markdown"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and text files are allowed"), false);
  }
};

// Upload instances
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

const uploadNote = multer({
  storage: notesStorage,
  fileFilter: notesFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = { uploadPDF, uploadNote };
