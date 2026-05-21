// src/services/vector/chromaStore.js
const { getOrCreateCollection } = require("../../config/chroma");
const { generateEmbeddings, generateSingleEmbedding } = require("../ai/embeddingsService");
const logger = require("../../utils/logger");

/**
 * Store document chunks in ChromaDB
 * @param {string} collectionName - Collection name (usually user-specific)
 * @param {Array<{id: string, text: string, metadata: object}>} chunks
 */
const storeChunks = async (collectionName, chunks) => {
  try {
    const collection = await getOrCreateCollection(collectionName);

    const texts = chunks.map((c) => c.text);
    const ids = chunks.map((c) => c.id);
    const metadatas = chunks.map((c) => c.metadata);

    // Generate embeddings
    logger.ai(`Generating embeddings for ${chunks.length} chunks...`);
    const embeddings = await generateEmbeddings(texts);

    // Store in ChromaDB
    await collection.add({
      ids,
      embeddings,
      documents: texts,
      metadatas,
    });

    logger.success(`Stored ${chunks.length} chunks in collection: ${collectionName}`);
    return { success: true, count: chunks.length };
  } catch (error) {
    logger.error("ChromaDB store error:", error);
    throw new Error(`Failed to store chunks: ${error.message}`);
  }
};

/**
 * Search for relevant chunks based on a query
 * @param {string} collectionName - ChromaDB collection name
 * @param {string} query - The search query
 * @param {number} nResults - Number of results to return
 * @param {object} whereFilter - Optional metadata filter
 */
const searchSimilarChunks = async (
  collectionName,
  query,
  nResults = 5,
  whereFilter = null
) => {
  try {
    const collection = await getOrCreateCollection(collectionName);

    // Generate query embedding
    const queryEmbedding = await generateSingleEmbedding(query);

    const searchParams = {
      queryEmbeddings: [queryEmbedding],
      nResults,
      include: ["documents", "metadatas", "distances"],
    };

    if (whereFilter) {
      searchParams.where = whereFilter;
    }

    const results = await collection.query(searchParams);

    // Format results
    const formattedResults = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        formattedResults.push({
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          score: 1 - results.distances[0][i], // Cosine similarity score
        });
      }
    }

    return formattedResults;
  } catch (error) {
    logger.error("ChromaDB search error:", error);
    throw new Error(`Failed to search: ${error.message}`);
  }
};

/**
 * Delete all chunks for a specific note
 */
const deleteNoteChunks = async (collectionName, noteId) => {
  try {
    const collection = await getOrCreateCollection(collectionName);
    await collection.delete({
      where: { noteId: noteId.toString() },
    });
    logger.success(`Deleted chunks for note: ${noteId}`);
  } catch (error) {
    logger.error("ChromaDB delete error:", error);
    // Don't throw - deletion failure shouldn't break the app
  }
};

module.exports = { storeChunks, searchSimilarChunks, deleteNoteChunks };
