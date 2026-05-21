// src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: null,
    },
    preferences: {
      theme: { type: String, default: "dark" },
      pomodoroWork: { type: Number, default: 25 },
      pomodoroBreak: { type: Number, default: 5 },
      dailyGoal: { type: Number, default: 4 }, // hours
      preferredAI: { type: String, enum: ["openai", "gemini"], default: "openai" },
    },
    stats: {
      totalStudyTime: { type: Number, default: 0 }, // minutes
      totalTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to return safe user data (without password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
