// src/services/pdf/pdfParser.js
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");

/**
 * Extract text from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    logger.info(`PDF parsed: ${path.basename(filePath)}, pages: ${data.numpages}`);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
    logger.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract text from a plain text file
 * @param {string} filePath - Absolute path to the text file
 * @returns {Promise<string>}
 */
const extractTextFromFile = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const text = fs.readFileSync(filePath, "utf-8");
    return { text, numPages: 1, info: {} };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
};

/**
 * Auto-detect file type and extract text
 */
const extractText = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    return await extractTextFromPDF(filePath);
  } else {
    return await extractTextFromFile(filePath);
  }
};

module.exports = { extractTextFromPDF, extractTextFromFile, extractText };
