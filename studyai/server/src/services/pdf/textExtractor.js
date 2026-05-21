// src/services/pdf/textExtractor.js

/**
 * Split text into overlapping chunks for embedding
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} Array of text chunks
 */
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || text.length === 0) return [];

  // Clean the text
  const cleaned = text
    .replace(/\n{3,}/g, "\n\n") // Normalize multiple newlines
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + chunkSize;

    // Try to break at a sentence boundary
    if (end < cleaned.length) {
      const breakPoints = [". ", "! ", "? ", "\n\n", "\n"];
      for (const bp of breakPoints) {
        const lastBreak = cleaned.lastIndexOf(bp, end);
        if (lastBreak > start + chunkSize / 2) {
          end = lastBreak + bp.length;
          break;
        }
      }
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - overlap;

    // Avoid creating tiny chunks at the end
    if (cleaned.length - start < chunkSize / 4) {
      break;
    }
  }

  // Add the last piece if there's remaining text not covered
  const lastChunkStart = Math.max(0, cleaned.length - chunkSize);
  const lastChunk = cleaned.slice(lastChunkStart).trim();
  if (lastChunk && !chunks.includes(lastChunk)) {
    chunks.push(lastChunk);
  }

  return chunks.filter((c) => c.length > 50); // Filter very short chunks
};

/**
 * Prepare chunks with metadata for vector storage
 */
const prepareChunksForEmbedding = (chunks, noteId, userId) => {
  return chunks.map((text, index) => ({
    id: `${noteId}-chunk-${index}`,
    text,
    metadata: {
      noteId: noteId.toString(),
      userId: userId.toString(),
      chunkIndex: index,
      charCount: text.length,
    },
  }));
};

/**
 * Clean and normalize extracted text
 */
const cleanExtractedText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n") // Form feeds
    .replace(/\t/g, " ") // Tabs to spaces
    .replace(/\n{4,}/g, "\n\n\n") // Max 3 consecutive newlines
    .replace(/ {2,}/g, " ") // Multiple spaces
    .trim();
};

module.exports = { chunkText, prepareChunksForEmbedding, cleanExtractedText };
