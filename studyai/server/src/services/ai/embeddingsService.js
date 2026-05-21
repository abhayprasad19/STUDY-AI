// src/services/ai/embeddingsService.js
const { getOpenAIClient } = require("../../config/openai");
const logger = require("../../utils/logger");

/**
 * Generate embeddings for an array of texts using OpenAI
 * @param {string[]} texts - Array of text strings to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
const generateEmbeddings = async (texts) => {
  try {
    const openai = getOpenAIClient();

    // Process in batches to avoid rate limits
    const batchSize = 100;
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
      });

      const batchEmbeddings = response.data.map((item) => item.embedding);
      allEmbeddings.push(...batchEmbeddings);

      logger.ai(`Generated embeddings for batch ${Math.floor(i / batchSize) + 1}`);
    }

    return allEmbeddings;
  } catch (error) {
    logger.error("Embedding generation error:", error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
};

/**
 * Generate a single embedding
 */
const generateSingleEmbedding = async (text) => {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
};

module.exports = { generateEmbeddings, generateSingleEmbedding };
