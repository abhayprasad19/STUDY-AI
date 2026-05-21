// src/utils/validators.js

const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

const sanitizeText = (text) => {
  if (!text) return "";
  return text.trim().replace(/<[^>]*>/g, ""); // Strip HTML tags
};

const truncateText = (text, maxLength = 500) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

module.exports = {
  validateEmail,
  validatePassword,
  validateObjectId,
  sanitizeText,
  truncateText,
};
