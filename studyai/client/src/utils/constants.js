// src/utils/constants.js
export const PRIORITY_COLORS = {
  low: "text-emerald-400 bg-emerald-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-orange-400 bg-orange-400/10",
  urgent: "text-red-400 bg-red-400/10",
};

export const STATUS_COLORS = {
  todo: "text-slate-400 bg-slate-400/10",
  "in-progress": "text-blue-400 bg-blue-400/10",
  completed: "text-emerald-400 bg-emerald-400/10",
};

export const CATEGORY_ICONS = {
  study: "📚",
  assignment: "📝",
  project: "🔬",
  revision: "🔄",
  other: "📌",
};

export const RECOMMENDATION_COLORS = {
  study: "from-brand-500 to-brand-700",
  productivity: "from-emerald-500 to-teal-700",
  wellness: "from-pink-500 to-rose-700",
  focus: "from-amber-500 to-orange-700",
};

export const AI_MODELS = [
  { value: "openai", label: "GPT-4o Mini", icon: "🤖" },
  { value: "gemini", label: "Gemini Flash", icon: "✨" },
];

export const POMODORO_PRESETS = [
  { label: "Classic", work: 25, break: 5 },
  { label: "Long", work: 50, break: 10 },
  { label: "Short", work: 15, break: 3 },
];
