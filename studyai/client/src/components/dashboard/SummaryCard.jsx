// src/components/dashboard/SummaryCard.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdExpandMore,
  MdExpandLess,
  MdDelete,
  MdLightbulb,
  MdFlipToFront,
  MdQuiz,
  MdAutoAwesome,
  MdCheckCircle,
  MdCancel,
  MdEmojiEvents,
  MdRefresh,
} from "react-icons/md";
import { timeAgo } from "../../utils/formatDate";

const FlashCard = ({ card }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: "600px" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-28"
      >
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-sm text-slate-300 font-medium">{card.question}</p>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-emerald-300">{card.answer}</p>
        </div>
      </motion.div>
      <p className="text-xs text-slate-600 text-center mt-1">
        {flipped ? "Answer" : "Question"} — click to flip
      </p>
    </div>
  );
};

const QuizWithReport = ({ questions }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  const handleAnswer = (questionIndex, option) => {
    if (submitted) return;
    setAnswers((p) => ({ ...p, [questionIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting!");
      return;
    }
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
  };

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctAnswer).length
    : 0;

  const percentage = submitted
    ? Math.round((score / questions.length) * 100)
    : 0;

  const getGrade = () => {
    if (percentage >= 90)
      return { label: "Excellent! 🏆", color: "text-yellow-400" };
    if (percentage >= 70)
      return { label: "Good Job! 👍", color: "text-emerald-400" };
    if (percentage >= 50)
      return { label: "Keep Practicing! 📚", color: "text-blue-400" };
    return { label: "Need More Study! 💪", color: "text-red-400" };
  };

  if (submitted) {
    const grade = getGrade();
    return (
      <div className="space-y-4">
        {/* Score Report */}
        <div className="p-5 rounded-2xl bg-white/3 border border-white/10 text-center">
          <MdEmojiEvents size={40} className="text-yellow-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">{grade.label}</h3>
          <div className="text-5xl font-bold text-white my-3">
            {score}/{questions.length}
          </div>
          <div className="text-sm text-slate-400 mb-3">{percentage}% Score</div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                percentage >= 70
                  ? "bg-emerald-500"
                  : percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <button
            onClick={handleRetry}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 text-sm hover:bg-brand-600/30 transition-colors"
          >
            <MdRefresh size={16} /> Retry Quiz
          </button>
        </div>

        {/* Detailed Review */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Review Answers
          </p>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <MdCheckCircle
                      size={16}
                      className="text-emerald-400 flex-shrink-0 mt-0.5"
                    />
                  ) : (
                    <MdCancel
                      size={16}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                  )}
                  <p className="text-sm font-medium text-slate-200">
                    Q{i + 1}. {q.question}
                  </p>
                </div>
                <div className="ml-6 space-y-1">
                  <p className="text-xs text-slate-400">
                    Your answer:{" "}
                    <span
                      className={
                        isCorrect ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {userAnswer}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-slate-400">
                      Correct:{" "}
                      <span className="text-emerald-400">
                        {q.correctAnswer}
                      </span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-xs text-slate-400">
          {Object.keys(answers).length} answered
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/10">
        <p className="text-sm font-medium text-slate-200 mb-3">
          Q{current + 1}. {q.question}
        </p>
        <div className="space-y-2">
          {q.options?.map((opt, i) => {
            const isSelected = answers[current] === opt;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(current, opt)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors border ${
                  isSelected
                    ? "border-brand-500/50 bg-brand-500/15 text-brand-300"
                    : "border-white/8 bg-white/3 text-slate-400 hover:bg-white/8 hover:text-slate-300"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrent((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="px-3 py-2 rounded-lg text-xs bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-40 transition-colors"
        >
          ← Previous
        </button>
        <div className="flex-1 flex gap-1 justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-6 h-6 rounded-full text-xs transition-colors ${
                current === i
                  ? "bg-brand-600 text-white"
                  : answers[i]
                    ? "bg-emerald-500/30 text-emerald-400"
                    : "bg-white/10 text-slate-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrent((p) => Math.min(questions.length - 1, p + 1))
            }
            className="px-3 py-2 rounded-lg text-xs bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-xs bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ summary, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "Summary", icon: MdAutoAwesome },
    { id: "keypoints", label: "Key Points", icon: MdLightbulb },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: MdFlipToFront,
      count: summary.flashcards?.length,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: MdQuiz,
      count: summary.quizQuestions?.length,
    },
  ];

  return (
    <motion.div layout className="glass-card overflow-hidden">
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">
              {summary.aiModel === "gemini"
                ? "✨ Gemini"
                : summary.aiModel === "groq"
                  ? "⚡ Groq"
                  : "🤖 GPT"}
            </span>
            <span className="text-xs text-slate-600">
              {timeAgo(summary.createdAt)}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate">
            {summary.title}
          </p>
          {!expanded && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {summary.summary?.substring(0, 120)}...
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(summary._id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
          >
            <MdDelete size={15} />
          </button>
          {expanded ? (
            <MdExpandLess size={18} className="text-slate-500" />
          ) : (
            <MdExpandMore size={18} className="text-slate-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1 px-4 pb-2 border-t border-white/8 pt-3">
              {tabs.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === id
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  {count > 0 && (
                    <span className="text-xs bg-white/10 rounded-full px-1.5 py-0.5 leading-none">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4">
              {activeTab === "summary" && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {summary.summary}
                </p>
              )}
              {activeTab === "keypoints" && (
                <ul className="space-y-2">
                  {summary.keyPoints?.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <span className="text-brand-400 mt-0.5 flex-shrink-0">
                        →
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "flashcards" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.flashcards?.map((card, i) => (
                    <FlashCard key={i} card={card} />
                  ))}
                </div>
              )}
              {activeTab === "quiz" && (
                <QuizWithReport questions={summary.quizQuestions || []} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SummaryCard;
