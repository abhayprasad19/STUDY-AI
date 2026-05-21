// src/services/ai/recommendationService.js
const { getOpenAIClient } = require("../../config/openai");
const { getGeminiModel } = require("../../config/gemini");
const logger = require("../../utils/logger");

/**
 * Generate personalized study recommendations based on user data
 */
const generateRecommendations = async (userData, aiModel = "openai") => {
  const {
    recentTasks,
    completedTasks,
    pendingTasks,
    focusSessions,
    totalStudyTime,
    streak,
    subjects,
  } = userData;

  const prompt = `You are a productivity and study coach AI. Based on the following student data, provide personalized recommendations.

Student Data:
- Total study time this week: ${Math.round(totalStudyTime / 60)} hours
- Study streak: ${streak} days
- Tasks completed: ${completedTasks}
- Pending tasks: ${pendingTasks}
- Recent focus sessions: ${focusSessions}
- Subjects studied: ${subjects.join(", ") || "Not specified"}
- Recent tasks: ${recentTasks.map((t) => t.title).join(", ") || "None"}

Provide 4-6 specific, actionable recommendations to improve study habits and productivity.

Respond ONLY with valid JSON:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "type": "study|productivity|wellness|focus",
      "priority": "high|medium|low",
      "estimatedImpact": "string"
    }
  ],
  "insight": "string - one key insight about their study patterns",
  "weeklyGoal": "string - a specific goal for this week"
}`;

  try {
    let responseText = "";

    if (aiModel === "gemini") {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } else {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });
      responseText = response.choices[0].message.content;
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    logger.ai("Recommendations generated");
    return parsed;
  } catch (error) {
    logger.error("Recommendation error:", error);
    // Return default recommendations on error
    return {
      recommendations: [
        {
          title: "Maintain Consistency",
          description: "Try to study at the same time each day to build a strong habit.",
          type: "study",
          priority: "high",
          estimatedImpact: "30% improvement in retention",
        },
        {
          title: "Use the Pomodoro Technique",
          description: "Work in 25-minute focused sessions with 5-minute breaks.",
          type: "focus",
          priority: "high",
          estimatedImpact: "Improved focus and reduced burnout",
        },
      ],
      insight: "Keep building your study streak for long-term success.",
      weeklyGoal: "Complete at least 3 focused study sessions this week.",
    };
  }
};

module.exports = { generateRecommendations };
