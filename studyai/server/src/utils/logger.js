// src/utils/logger.js
const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (message, data = null) => {
    if (isDev) {
      console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, data || "");
    }
  },
  error: (message, error = null) => {
    console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error || "");
  },
  warn: (message, data = null) => {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`, data || "");
  },
  success: (message, data = null) => {
    if (isDev) {
      console.log(`✅ [SUCCESS] ${new Date().toISOString()} - ${message}`, data || "");
    }
  },
  ai: (message, data = null) => {
    if (isDev) {
      console.log(`🤖 [AI] ${new Date().toISOString()} - ${message}`, data || "");
    }
  },
};

module.exports = logger;
