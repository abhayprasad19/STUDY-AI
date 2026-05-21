// src/components/dashboard/SummaryCard.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdExpandMore, MdExpandLess, MdDelete, MdLightbulb,
  MdFlipToFront, MdQuiz, MdAutoAwesome,
} from "react-icons/md";
import { timeAgo } from "../../utils/formatDate";

const FlashCard = ({ card, index }) => {
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
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-sm text-slate-300 font-medium">{card.question}</p>
        </div>
        {/* Back */}
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

const QuizQuestion = ({ q, index }) => {
  const [selected, setSelected] = useState(null);
  const correct = q.correctAnswer;

  return (
    <div className="p-3 rounded-xl bg-white/3 border border-white/8">
      <p className="text-sm font-medium text-slate-200 mb-2">
        Q{index + 1}. {q.question}
      </p>
      <div className="space-y-1.5">
        {q.options?.map((opt, i) => {
          const isCorrect = opt === correct;
          const isSelected = selected === opt;
          let cls = "border border-white/8 bg-white/3 text-slate-400 hover:bg-white/8";
          if (selected) {
            if (isCorrect) cls = "border border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
            else if (isSelected) cls = "border border-red-500/50 bg-red-500/10 text-red-300";
          }
          return (
            <button
              key={i}
              onClick={() => !selected && setSelected(opt)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected && q.explanation && (
        <p className="mt-2 text-xs text-slate-500 italic">💡 {q.explanation}</p>
      )}
    </div>
  );
};

const SummaryCard = ({ summary, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "Summary", icon: MdAutoAwesome },
    { id: "keypoints", label: "Key Points", icon: MdLightbulb },
    { id: "flashcards", label: "Flashcards", icon: MdFlipToFront, count: summary.flashcards?.length },
    { id: "quiz", label: "Quiz", icon: MdQuiz, count: summary.quizQuestions?.length },
  ];

  return (
    <motion.div layout className="glass-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">
              {summary.aiModel === "gemini" ? "✨ Gemini" : "🤖 GPT"}
            </span>
            <span className="text-xs text-slate-600">{timeAgo(summary.createdAt)}</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate">{summary.title}</p>
          {!expanded && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{summary.summary?.substring(0, 120)}...</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(summary._id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
          >
            <MdDelete size={15} />
          </button>
          {expanded ? <MdExpandLess size={18} className="text-slate-500" /> : <MdExpandMore size={18} className="text-slate-500" />}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
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
                    <span className="text-xs bg-white/10 rounded-full px-1.5 py-0.5 leading-none">{count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4">
              {activeTab === "summary" && (
                <p className="text-sm text-slate-300 leading-relaxed">{summary.summary}</p>
              )}

              {activeTab === "keypoints" && (
                <ul className="space-y-2">
                  {summary.keyPoints?.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-brand-400 mt-0.5 flex-shrink-0">→</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "flashcards" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.flashcards?.map((card, i) => (
                    <FlashCard key={i} card={card} index={i} />
                  ))}
                </div>
              )}

              {activeTab === "quiz" && (
                <div className="space-y-3">
                  {summary.quizQuestions?.map((q, i) => (
                    <QuizQuestion key={i} q={q} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SummaryCard;
