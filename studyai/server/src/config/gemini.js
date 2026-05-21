// src/config/gemini.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

let geminiClient = null;

const getGeminiClient = () => {
  // DEBUG: CHECK WHICH KEY IS LOADED
  console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return geminiClient;
};

// WORKING FREE MODEL
const getGeminiModel = (modelName = "gemini-2.0-flash") => {
  const client = getGeminiClient();

  return client.getGenerativeModel({
    model: modelName,
  });
};

module.exports = {
  getGeminiClient,
  getGeminiModel,
};
