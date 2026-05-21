// src/pages/dashboard/Notes.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MdUpload,
  MdNote,
  MdQuiz,
  MdEmojiEvents,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdClose,
} from "react-icons/md";
import { aiService } from "../../services/aiService";
import NoteCard from "../../components/dashboard/NoteCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import UploadForm from "../../components/forms/UploadForm";
import { PageLoader } from "../../components/ui/Loader";
import toast from "react-hot-toast";

// =====================
// QUIZ MODAL COMPONENT
// =====================
const QuizModal = ({ questions, noteTitle, onClose }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  const handleAnswer = (index, option) => {
    if (submitted) return;
    setAnswers((p) => ({ ...p, [index]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions first!");
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
      return {
        label: "Excellent! 🏆",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    if (percentage >= 70)
      return {
        label: "Good Job! 👍",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
      };
    if (percentage >= 50)
      return {
        label: "Keep Practicing! 📚",
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/30",
      };
    return {
      label: "Need More Study! 💪",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
    };
  };

  if (submitted) {
    const grade = getGrade();
    return (
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Score Card */}
        <div className={`p-6 rounded-2xl border text-center ${grade.bg}`}>
          <MdEmojiEvents size={48} className={`${grade.color} mx-auto mb-2`} />
          <h3 className={`text-2xl font-bold mb-1 ${grade.color}`}>
            {grade.label}
          </h3>
          <div className="text-6xl font-bold text-white my-3">
            {score}
            <span className="text-2xl text-slate-400">/{questions.length}</span>
          </div>
          <p className="text-slate-400 mb-4">
            {percentage}% — {noteTitle}
          </p>
          <div className="w-full bg-white/10 rounded-full h-3 mb-5">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${percentage >= 70 ? "bg-emerald-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-sm hover:bg-white/15 transition-colors"
            >
              <MdRefresh size={16} /> Retry Quiz
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-500 transition-colors"
            >
              <MdClose size={16} /> Close
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Detailed Review
          </p>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}
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
                      {answers[i]}
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
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span>{Object.keys(answers).length} answered</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/10">
        <p className="text-sm font-semibold text-slate-200 mb-4">
          Q{current + 1}. {q.question}
        </p>
        <div className="space-y-2">
          {q.options?.map((opt, i) => {
            const isSelected = answers[current] === opt;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(current, opt)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                  isSelected
                    ? "border-brand-500/60 bg-brand-500/15 text-brand-300 font-medium"
                    : "border-white/8 bg-white/3 text-slate-400 hover:bg-white/8 hover:text-slate-200 hover:border-white/15"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex gap-1.5 justify-center">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
              current === i
                ? "bg-brand-600 text-white"
                : answers[i]
                  ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/10 text-slate-500 hover:bg-white/15"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrent((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="flex-1 py-2.5 rounded-xl text-sm bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-40 transition-colors"
        >
          ← Previous
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((p) => p + 1)}
            className="flex-1 py-2.5 rounded-xl text-sm bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
          >
            Submit & See Report 🎯
          </button>
        )}
      </div>
    </div>
  );
};

// =====================
// MAIN NOTES PAGE
// =====================
const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [quizModal, setQuizModal] = useState(null); // { questions, title }
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const { data } = await aiService.getNotes();
      setNotes(data?.notes || []);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const processing = notes.some((n) => !n.isProcessed);
    if (!processing) return;
    const timer = setInterval(fetchNotes, 5000);
    return () => clearInterval(timer);
  }, [notes]);

  const handleDelete = async (id) => {
    try {
      await aiService.deleteNote(id);
      setNotes((p) => p.filter((n) => n._id !== id));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleSummarize = async (note) => {
    if (!note.isProcessed) {
      toast.error("Note is still processing");
      return;
    }
    try {
      const { data } = await aiService.summarize({ noteId: note._id });
      if (data.success) {
        toast.success("Summary generated!");
        navigate("/summaries");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate summary");
    }
  };

  const handleChat = (note) => {
    if (!note.isEmbedded) {
      toast.error("Note not ready for chat yet.");
      return;
    }
    navigate(`/chat?noteId=${note._id}`);
  };

  const handleQuiz = async (note) => {
    if (!note.isProcessed) {
      toast.error("Note is still processing");
      return;
    }
    setGeneratingQuiz(note._id);
    try {
      const { data } = await aiService.generateQuiz({ noteId: note._id });
      if (data.quizQuestions?.length > 0) {
        setQuizModal({ questions: data.quizQuestions, title: note.title });
      } else {
        toast.error("Could not generate quiz questions");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setGeneratingQuiz(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-5 lg:p-7 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            Notes & PDFs
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {notes.length} documents uploaded
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          icon={<MdUpload size={18} />}
          variant="gradient"
        >
          Upload
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <MdNote size={44} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-lg">No documents yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Upload PDFs or text files to get AI summaries and chat
          </p>
          <Button
            onClick={() => setUploadOpen(true)}
            variant="gradient"
            className="mt-5"
            icon={<MdUpload size={16} />}
          >
            Upload First Document
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={handleDelete}
                onChat={handleChat}
                onSummarize={handleSummarize}
                onQuiz={handleQuiz}
                quizLoading={generatingQuiz === note._id}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Upload modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        size="md"
      >
        <UploadForm
          onSuccess={(note) => {
            setNotes((p) => [note, ...p]);
            setUploadOpen(false);
          }}
          onClose={() => setUploadOpen(false)}
        />
      </Modal>

      {/* Quiz modal */}
      <Modal
        isOpen={!!quizModal}
        onClose={() => setQuizModal(null)}
        title={`📝 Quiz — ${quizModal?.title || ""}`}
        size="md"
      >
        {quizModal && (
          <QuizModal
            questions={quizModal.questions}
            noteTitle={quizModal.title}
            onClose={() => setQuizModal(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Notes;
