// src/services/ai/productivityInsights.js
const { getOpenAIClient } = require("../../config/openai");
const logger = require("../../utils/logger");

/**
 * Generate AI-powered productivity insights from analytics data
 */
const generateProductivityInsights = async (analyticsData) => {
  const prompt = `As a productivity coach, analyze this student's weekly data and provide insights.

Data:
- Daily study hours: ${JSON.stringify(analyticsData.dailyHours)}
- Task completion rate: ${analyticsData.completionRate}%
- Average focus score: ${analyticsData.avgFocusScore || "N/A"}
- Total focus sessions: ${analyticsData.totalSessions}
- Most productive day: ${analyticsData.mostProductiveDay || "Unknown"}
- Study subjects: ${analyticsData.subjects?.join(", ") || "Various"}

Provide:
1. 2-3 key insights about their productivity patterns
2. 2-3 specific improvement suggestions
3. An overall productivity score (0-100)

Respond ONLY with valid JSON:
{
  "insights": ["insight1", "insight2", "insight3"],
  "suggestions": ["suggestion1", "suggestion2"],
  "productivityScore": 75,
  "trend": "improving|declining|stable",
  "encouragement": "string - motivational message"
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    logger.ai("Productivity insights generated");
    return parsed;
  } catch (error) {
    logger.error("Productivity insights error:", error);
    return {
      insights: ["Keep tracking your study sessions for better insights."],
      suggestions: ["Try to maintain a consistent study schedule."],
      productivityScore: 50,
      trend: "stable",
      encouragement: "Every study session counts. Keep going!",
    };
  }
};

module.exports = { generateProductivityInsights };
