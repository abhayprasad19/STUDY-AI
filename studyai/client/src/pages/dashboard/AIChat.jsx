// src/pages/dashboard/AIChat.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdChat, MdDelete, MdPictureAsPdf } from "react-icons/md";
import { aiService } from "../../services/aiService";
import AIChatBox from "../../components/dashboard/AIChatBox";
import useChat from "../../hooks/useChat";
import Button from "../../components/ui/Button";
import { AI_MODELS } from "../../utils/constants";
import { timeAgo } from "../../utils/formatDate";
import { PageLoader } from "../../components/ui/Loader";
import toast from "react-hot-toast";

const AIChat = () => {
  const [searchParams] = useSearchParams();
  const initialNoteId = searchParams.get("noteId");

  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const [chats, setChats] = useState([]);
  const [notes, setNotes] = useState([]);
  const [aiModel, setAiModel] = useState("openai");
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const { messages, loading, chatId, sendMessage, loadChat, clearChat } = useChat(selectedNoteId);

  useEffect(() => {
    const load = async () => {
      try {
        const [chatsRes, notesRes] = await Promise.all([
          aiService.getChats(),
          aiService.getNotes(),
        ]);
        setChats(chatsRes.data?.chats || []);
        setNotes(notesRes.data?.notes?.filter((n) => n.isEmbedded) || []);
      } catch {}
      finally { setLoadingChats(false); }
    };
    load();
  }, []);

  const handleSend = async (message) => {
    await sendMessage(message, aiModel);
    // Refresh chat list
    const { data } = await aiService.getChats();
    setChats(data?.chats || []);
  };

  const handleLoadChat = async (id) => {
    setSelectedChatId(id);
    await loadChat(id);
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await aiService.deleteChat(id);
      setChats((p) => p.filter((c) => c._id !== id));
      if (selectedChatId === id) { clearChat(); setSelectedChatId(null); }
      toast.success("Chat deleted");
    } catch { toast.error("Failed to delete chat"); }
  };

  const handleNewChat = () => {
    clearChat();
    setSelectedChatId(null);
    setSelectedNoteId(null);
  };

  if (loadingChats) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left sidebar — chat history */}
      <aside className="w-64 flex-shrink-0 border-r border-white/8 bg-surface-900 flex flex-col hidden md:flex">
        <div className="p-3 border-b border-white/8">
          <Button onClick={handleNewChat} icon={<MdAdd size={16} />} fullWidth variant="secondary" size="sm">
            New Chat
          </Button>
        </div>

        {/* Note selector */}
        {notes.length > 0 && (
          <div className="p-3 border-b border-white/8">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              Chat with document
            </label>
            <select
              value={selectedNoteId || ""}
              onChange={(e) => setSelectedNoteId(e.target.value || null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500/50 transition-all"
            >
              <option value="" className="bg-surface-800">General AI Chat</option>
              {notes.map((n) => (
                <option key={n._id} value={n._id} className="bg-surface-800">
                  📄 {n.title.slice(0, 28)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wider px-2 py-1.5">History</p>
          {chats.length === 0 && (
            <p className="text-xs text-slate-600 px-2 py-2">No conversations yet</p>
          )}
          {chats.map((c) => (
            <div
              key={c._id}
              onClick={() => handleLoadChat(c._id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors ${
                selectedChatId === c._id ? "bg-brand-600/20 text-brand-400" : "hover:bg-white/5 text-slate-400"
              }`}
            >
              <MdChat size={14} className="flex-shrink-0" />
              <span className="text-xs flex-1 min-w-0 truncate">{c.title}</span>
              <button
                onClick={(e) => handleDeleteChat(c._id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all"
              >
                <MdDelete size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* AI Model selector */}
        <div className="p-3 border-t border-white/8">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">AI Model</label>
          <div className="flex gap-1">
            {AI_MODELS.map((m) => (
              <button
                key={m.value}
                onClick={() => setAiModel(m.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  aiModel === m.value ? "bg-brand-600/20 text-brand-400 border border-brand-500/30" : "text-slate-500 hover:bg-white/5"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
          {selectedNoteId ? (
            <>
              <MdPictureAsPdf size={18} className="text-red-400" />
              <span className="text-sm font-medium text-slate-300">
                {notes.find((n) => n._id === selectedNoteId)?.title || "Document Chat"}
              </span>
              <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">RAG enabled</span>
            </>
          ) : (
            <>
              <MdChat size={18} className="text-brand-400" />
              <span className="text-sm font-medium text-slate-300">General AI Assistant</span>
            </>
          )}
          <span className="ml-auto text-xs text-slate-600">
            {AI_MODELS.find((m) => m.value === aiModel)?.icon} {AI_MODELS.find((m) => m.value === aiModel)?.label}
          </span>
        </div>

        <AIChatBox
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder={
            selectedNoteId
              ? "Ask a question about your document..."
              : "Ask me anything about studying, concepts, or productivity..."
          }
        />
      </main>
    </div>
  );
};

export default AIChat;
