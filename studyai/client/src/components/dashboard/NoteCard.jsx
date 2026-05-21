// src/components/dashboard/NoteCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { MdPictureAsPdf, MdTextSnippet, MdDelete, MdChat, MdSummarize, MdCheckCircle, MdHourglassEmpty } from "react-icons/md";
import { timeAgo } from "../../utils/formatDate";
import { truncate } from "../../utils/helperFunctions";

const NoteCard = ({ note, onDelete, onChat, onSummarize }) => {
  const isPDF = note.type === "pdf";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4 hover:border-white/15 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isPDF ? "bg-red-500/15 text-red-400" : "bg-brand-500/15 text-brand-400"
        }`}>
          {isPDF ? <MdPictureAsPdf size={20} /> : <MdTextSnippet size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{note.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {note.subject} · {timeAgo(note.createdAt)}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
          note.isProcessed
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-yellow-500/10 text-yellow-400"
        }`}>
          {note.isProcessed
            ? <><MdCheckCircle size={11} /> Processed</>
            : <><MdHourglassEmpty size={11} /> Processing...</>
          }
        </span>
        {note.isEmbedded && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">
            🔮 Embedded
          </span>
        )}
      </div>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/8">
        <button
          onClick={() => onSummarize(note)}
          disabled={!note.isProcessed}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <MdSummarize size={13} /> Summarize
        </button>
        <button
          onClick={() => onChat(note)}
          disabled={!note.isEmbedded}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <MdChat size={13} /> Chat
        </button>
        <button
          onClick={() => onDelete(note._id)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MdDelete size={15} />
        </button>
      </div>
    </motion.div>
  );
};

export default NoteCard;
