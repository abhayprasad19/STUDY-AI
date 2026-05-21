// src/services/vector/vectorSearch.js
const { searchSimilarChunks } = require("./chromaStore");
const logger = require("../../utils/logger");

/**
 * Get relevant context for a question from a specific note
 */
const getRelevantContext = async (query, collectionName, noteId, topK = 5) => {
  try {
    const whereFilter = noteId ? { noteId: noteId.toString() } : undefined;

    const results = await searchSimilarChunks(
      collectionName,
      query,
      topK,
      whereFilter
    );

    // Filter by relevance threshold
    const relevant = results.filter((r) => r.score > 0.3);

    if (relevant.length === 0) {
      return { context: "", sources: [] };
    }

    // Combine into context string
    const context = relevant
      .map((r, i) => `[Context ${i + 1}]:\n${r.text}`)
      .join("\n\n---\n\n");

    const sources = relevant.map((r) => ({
      text: r.text.substring(0, 200) + "...",
      score: r.score,
      chunkIndex: r.metadata.chunkIndex,
    }));

    logger.ai(`Found ${relevant.length} relevant chunks for query`);
    return { context, sources };
  } catch (error) {
    logger.error("Vector search error:", error);
    return { context: "", sources: [] };
  }
};

module.exports = { getRelevantContext };
