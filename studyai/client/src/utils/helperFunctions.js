// src/utils/helperFunctions.js
export const truncate = (str, len = 80) =>
  str?.length > len ? str.substring(0, len) + "..." : str || "";

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export const bytesToSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const clsx = (...classes) => classes.filter(Boolean).join(" ");

export const debounce = (fn, delay) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export const getPriorityWeight = (priority) => {
  const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
  return weights[priority] || 0;
};
