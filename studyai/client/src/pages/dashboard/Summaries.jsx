// src/pages/dashboard/Summaries.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdSummarize, MdUpload, MdAutoAwesome } from "react-icons/md";
import { aiService } from "../../services/aiService";
import SummaryCard from "../../components/dashboard/SummaryCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Loader";
import { AI_MODELS } from "../../utils/constants";
import { clsx } from "../../utils/helperFunctions";
import toast from "react-hot-toast";

const Summaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [form, setForm] = useState({ noteId: "", text: "", aiModel: "openai", subject: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, notesRes] = await Promise.all([
          aiService.getSummaries(),
          aiService.getNotes(),
        ]);
        setSummaries(sumRes.data?.summaries || []);
        setNotes(notesRes.data?.notes?.filter((n) => n.isProcessed) || []);
      } catch { toast.error("Failed to load summaries"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.noteId && !form.text.trim()) {
      toast.error("Select a document or enter text");
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        aiModel: form.aiModel,
        subject: form.subject || "General",
        ...(form.noteId ? { noteId: form.noteId } : { text: form.text }),
      };
      const { data } = await aiService.summarize(payload);
      setSummaries((p) => [data.summary, ...p]);
      setModalOpen(false);
      setForm({ noteId: "", text: "", aiModel: "openai", subject: "" });
      toast.success("Summary generated! 🎉");
    } catch (err) {
      toast.error(err.message || "Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await aiService.deleteSummary(id);
      setSummaries((p) => p.filter((s) => s._id !== id));
      toast.success("Summary deleted");
    } catch { toast.error("Failed to delete summary"); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">AI Summaries</h2>
          <p className="text-sm text-slate-500 mt-0.5">{summaries.length} summaries generated</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<MdAutoAwesome size={17} />} variant="gradient">
          Generate Summary
        </Button>
      </div>

      {/* Summaries list */}
      {summaries.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <MdSummarize size={44} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-lg">No summaries yet</p>
          <p className="text-slate-600 text-sm mt-1">Generate AI summaries with flashcards and quizzes</p>
          <Button onClick={() => setModalOpen(true)} variant="gradient" className="mt-5" icon={<MdAutoAwesome size={16} />}>
            Generate First Summary
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {summaries.map((s) => (
              <SummaryCard key={s._id} summary={s} onDelete={handleDelete} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Generate modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate AI Summary" size="md">
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Source */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Source</label>
            {notes.length > 0 && (
              <select
                value={form.noteId}
                onChange={(e) => setForm((p) => ({ ...p, noteId: e.target.value, text: "" }))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500/60 transition-all"
              >
                <option value="" className="bg-surface-800">— Select a document —</option>
                {notes.map((n) => (
                  <option key={n._id} value={n._id} className="bg-surface-800">📄 {n.title}</option>
                ))}
              </select>
            )}
          </div>

          {!form.noteId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Or paste text</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                placeholder="Paste your notes, article, or text here (min 100 chars)..."
                rows={6}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Biology"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Model</label>
              <div className="flex gap-1.5">
                {AI_MODELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, aiModel: m.value }))}
                    className={clsx(
                      "flex-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-colors border",
                      form.aiModel === m.value
                        ? "bg-brand-600/20 text-brand-400 border-brand-500/30"
                        : "text-slate-500 border-white/10 hover:bg-white/5"
                    )}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={generating} fullWidth variant="gradient" icon={<MdAutoAwesome size={15} />}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Summaries;
