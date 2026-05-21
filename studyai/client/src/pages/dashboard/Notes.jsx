// src/pages/dashboard/Notes.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdUpload, MdNote } from "react-icons/md";
import { aiService } from "../../services/aiService";
import NoteCard from "../../components/dashboard/NoteCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import UploadForm from "../../components/forms/UploadForm";
import { PageLoader } from "../../components/ui/Loader";
import toast from "react-hot-toast";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const { data } = await aiService.getNotes();
      setNotes(data?.notes || []);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  // Refresh processing notes every 5s
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
    } catch { toast.error("Failed to delete note"); }
  };

  const handleSummarize = async (note) => {
    if (!note.isProcessed) { toast.error("Note is still processing"); return; }
    setSummarizing(note._id);
    try {
      const { data } = await aiService.summarize({ noteId: note._id });
      if (data.success) {
        toast.success("Summary generated!");
        navigate("/summaries");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate summary");
    } finally {
      setSummarizing(null);
    }
  };

  const handleChat = (note) => {
    if (!note.isEmbedded) { toast.error("Note is not yet ready for chat. Wait for processing to complete."); return; }
    navigate(`/chat?noteId=${note._id}`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-5 lg:p-7 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Notes & PDFs</h2>
          <p className="text-sm text-slate-500 mt-0.5">{notes.length} documents uploaded</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} icon={<MdUpload size={18} />} variant="gradient">
          Upload
        </Button>
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <MdNote size={44} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-lg">No documents yet</p>
          <p className="text-slate-600 text-sm mt-1">Upload PDFs or text files to get AI summaries and chat</p>
          <Button onClick={() => setUploadOpen(true)} variant="gradient" className="mt-5" icon={<MdUpload size={16} />}>
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
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Upload modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document" size="md">
        <UploadForm
          onSuccess={(note) => {
            setNotes((p) => [note, ...p]);
            setUploadOpen(false);
          }}
          onClose={() => setUploadOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Notes;
