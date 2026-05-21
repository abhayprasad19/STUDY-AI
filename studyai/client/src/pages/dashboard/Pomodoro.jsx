// src/pages/dashboard/Pomodoro.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPlayArrow, MdPause, MdRefresh, MdSkipNext, MdCheckCircle } from "react-icons/md";
import { analyticsService } from "../../services/analyticsService";
import { taskService } from "../../services/taskService";
import { formatDuration } from "../../utils/formatDate";
import { POMODORO_PRESETS } from "../../utils/constants";
import toast from "react-hot-toast";

const MODES = {
  focus: { label: "Focus", color: "from-brand-600 to-purple-600", ring: "brand-500" },
  "short-break": { label: "Short Break", color: "from-emerald-600 to-teal-600", ring: "emerald-500" },
  "long-break": { label: "Long Break", color: "from-amber-600 to-orange-600", ring: "amber-500" },
};

const Pomodoro = () => {
  const [preset, setPreset] = useState(POMODORO_PRESETS[0]);
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(preset.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // seconds
  const [sessionStart, setSessionStart] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const intervalRef = useRef(null);

  const totalTime = mode === "focus" ? preset.work * 60 : mode === "short-break" ? preset.break * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Load tasks
  useEffect(() => {
    taskService.getTasks({ status: "todo", limit: 20 })
      .then(({ data }) => setTasks(data?.tasks || []))
      .catch(() => {});
  }, []);

  // Reset timer when mode or preset changes
  useEffect(() => {
    const t = mode === "focus" ? preset.work * 60 : mode === "short-break" ? preset.break * 60 : 15 * 60;
    setTimeLeft(t);
    setIsRunning(false);
  }, [mode, preset]);

  // Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    const completed = totalTime;

    if (mode === "focus") {
      setSessionsCompleted((s) => s + 1);
      setTotalFocusTime((t) => t + completed);

      // Log to backend
      try {
        await analyticsService.logSession({
          type: "focus",
          duration: totalTime,
          completedDuration: completed,
          isCompleted: true,
          taskId: selectedTask || null,
          focusScore: Math.floor(80 + Math.random() * 20),
        });
      } catch {}

      toast.success("🎉 Focus session complete! Great work!");

      // Auto switch to break
      const newMode = sessionsCompleted % 4 === 3 ? "long-break" : "short-break";
      setTimeout(() => setMode(newMode), 1000);
    } else {
      toast.success("Break over! Ready to focus? 💪");
      setTimeout(() => setMode("focus"), 1000);
    }
  }, [mode, totalTime, sessionsCompleted, selectedTask]);

  const handleStart = () => {
    if (!isRunning && mode === "focus") setSessionStart(new Date());
    setIsRunning((r) => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const handleSkip = () => {
    setIsRunning(false);
    const next = mode === "focus"
      ? (sessionsCompleted % 4 === 3 ? "long-break" : "short-break")
      : "focus";
    setMode(next);
  };

  // Progress ring
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  const modeInfo = MODES[mode];

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white">Pomodoro Timer</h2>
        <p className="text-sm text-slate-500 mt-0.5">Stay focused, take breaks, track your sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Timer — main panel */}
        <div className="lg:col-span-3 glass-card p-8 flex flex-col items-center">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/8 mb-8">
            {Object.entries(MODES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === key ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Circle */}
          <div className="relative mb-8">
            <svg width={220} height={220} className="-rotate-90">
              {/* Track */}
              <circle cx={110} cy={110} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
              {/* Progress */}
              <motion.circle
                cx={110} cy={110} r={r} fill="none"
                stroke="url(#timerGradient)" strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transition={{ duration: 1, ease: "linear" }}
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p
                key={timeLeft}
                className="text-5xl font-display font-bold text-white tabular-nums"
              >
                {formatDuration(timeLeft)}
              </motion.p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{modeInfo.label}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MdRefresh size={20} />
            </button>
            <button
              onClick={handleStart}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${modeInfo.color} flex items-center justify-center text-white shadow-xl transition-transform active:scale-95`}
            >
              {isRunning ? <MdPause size={28} /> : <MdPlayArrow size={28} />}
            </button>
            <button
              onClick={handleSkip}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MdSkipNext size={20} />
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Session Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Completed", value: sessionsCompleted, icon: "✅" },
                { label: "Focus Time", value: `${Math.floor(totalFocusTime / 60)}m`, icon: "⏱️" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                  <p className="text-lg">{icon}</p>
                  <p className="text-xl font-display font-bold text-white mt-1">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preset selector */}
          <div className="glass-card p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-white">Presets</h3>
            {POMODORO_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPreset(p)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                  preset.label === p.label
                    ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                    : "bg-white/3 text-slate-400 hover:bg-white/8 border border-white/8"
                }`}
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-xs opacity-70">{p.work}m / {p.break}m</span>
              </button>
            ))}
          </div>

          {/* Task selector */}
          {tasks.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white">Focusing on</h3>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 transition-all"
              >
                <option value="" className="bg-surface-800">No specific task</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id} className="bg-surface-800">
                    {t.title.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
