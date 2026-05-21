// src/services/ai/chatService.js
const { getGeminiModel } = require("../../config/gemini");
const { getRelevantContext } = require("../vector/vectorSearch");
const logger = require("../../utils/logger");
const Groq = require("groq-sdk");

const generateRAGResponse = async (
  userMessage,
  chatHistory = [],
  collectionName = null,
  noteId = null,
  aiModel = "groq",
) => {
  try {
    let context = "";
    let sources = [];

    if (collectionName) {
      try {
        const result = await getRelevantContext(
          userMessage,
          collectionName,
          noteId,
          5,
        );
        context = result.context;
        sources = result.sources;
      } catch (e) {
        logger.error(
          "Vector search failed, continuing without context:",
          e.message,
        );
      }
    }

    const systemPrompt = context
      ? `You are a helpful AI study assistant. Answer questions based on the provided document context.

IMPORTANT RULES:
- Answer ONLY based on the provided context
- If the answer is not in the context, say "I couldn't find this information in the uploaded document"
- Be concise but thorough
- Format your response with markdown when helpful

Document Context:
${context}`
      : `You are a helpful AI study assistant. Help students learn, understand concepts, and improve their productivity.
Be encouraging, clear, and educational in your responses.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-10),
      { role: "user", content: userMessage },
    ];

    let responseText = "";

    // =========================
    // GROQ (PRIMARY)
    // =========================
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      responseText = response.choices[0].message.content;
      logger.info("Chat response generated using Groq");
    } catch (groqError) {
      logger.error("Groq failed, falling back to Gemini:", groqError.message);

      // =========================
      // GEMINI (FALLBACK)
      // =========================
      const model = getGeminiModel("gemini-2.0-flash");

      const geminiHistory = chatHistory.slice(-10).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history: geminiHistory,
        systemInstruction: systemPrompt,
      });

      const result = await chat.sendMessage(userMessage);
      responseText = result.response.text();
      logger.info("Chat response generated using Gemini fallback");
    }

    logger.ai(`Chat response generated`);

    return {
      response: responseText,
      sources,
      aiModel,
    };
  } catch (error) {
    logger.error("Chat service error:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

const generateSimpleResponse = async (
  userMessage,
  chatHistory = [],
  aiModel = "groq",
) => {
  return generateRAGResponse(userMessage, chatHistory, null, null, aiModel);
};

module.exports = { generateRAGResponse, generateSimpleResponse };
