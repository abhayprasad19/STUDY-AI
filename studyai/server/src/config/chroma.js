// src/config/chroma.js
const { ChromaClient } = require("chromadb");

let chromaClient = null;

const getChromaClient = async () => {
  if (!chromaClient) {
    try {
      chromaClient = new ChromaClient({
        path: process.env.CHROMA_URL || "http://localhost:8000",
      });
      // Test connection
      await chromaClient.heartbeat();
      console.log("✅ ChromaDB Connected");
    } catch (error) {
      console.warn(
        "⚠️  ChromaDB not available, using in-memory fallback:",
        error.message
      );
      // Use in-memory client as fallback
      chromaClient = new ChromaClient();
    }
  }
  return chromaClient;
};

// Get or create a collection for a user's documents
const getOrCreateCollection = async (collectionName) => {
  const client = await getChromaClient();
  try {
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { "hnsw:space": "cosine" },
    });
    return collection;
  } catch (error) {
    throw new Error(`Failed to get/create collection: ${error.message}`);
  }
};

module.exports = { getChromaClient, getOrCreateCollection };
