// src/services/ai/summaryService.js

const { getGeminiModel } = require("../../config/gemini");
const logger = require("../../utils/logger");
const Groq = require("groq-sdk");

const generateSummary = async (text, aiModel = "groq") => {
  const startTime = Date.now();

  const maxTextLength = 12000;
  const truncated =
    text.length > maxTextLength
      ? text.substring(0, maxTextLength) +
        "\n\n[Content truncated for processing...]"
      : text;

  const prompt = `
You are an expert study assistant.

Analyze the following text and provide:

1. A comprehensive summary (3-5 paragraphs)
2. Key points (8-12 bullet points)
3. Flashcards (8 question-answer pairs)
4. Quiz questions (5 MCQs)

Text to analyze:
"""
${truncated}
"""

Respond ONLY with valid JSON in this exact format:

{
  "summary": "string",
  "keyPoints": ["point1", "point2"],
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "quizQuestions": [
    {
      "question": "string",
      "options": [
        "A) option1",
        "B) option2",
        "C) option3",
        "D) option4"
      ],
      "correctAnswer": "A) option1",
      "explanation": "string"
    }
  ]
}
`;

  let responseText = "";
  let tokensUsed = 0;
  let usedModel = aiModel;

  try {
    // =========================
    // GROQ (PRIMARY)
    // =========================
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      responseText = response.choices[0].message.content;
      tokensUsed = response.usage?.total_tokens || 0;
      usedModel = "groq";

      logger.info("Summary generated using Groq");
    } catch (groqError) {
      logger.error("Groq failed, falling back to Gemini:", groqError.message);

      // =========================
      // GEMINI (FALLBACK)
      // =========================
      const model = getGeminiModel("gemini-2.0-flash");
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      usedModel = "gemini";

      logger.info("Summary generated using Gemini fallback");
    }

    // Parse JSON safely
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    const generationTime = Date.now() - startTime;
    logger.ai(`Summary generated in ${generationTime}ms using ${usedModel}`);

    return {
      summary: parsed.summary || "Summary could not be generated.",
      keyPoints: parsed.keyPoints || [],
      flashcards: parsed.flashcards || [],
      quizQuestions: parsed.quizQuestions || [],
      tokensUsed,
      generationTime,
    };
  } catch (error) {
    logger.error("Summary generation error:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

module.exports = { generateSummary };
