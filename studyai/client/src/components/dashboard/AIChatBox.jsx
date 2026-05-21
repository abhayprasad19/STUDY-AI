// src/components/dashboard/AIChatBox.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSend,
  MdPerson,
  MdAutoAwesome,
  MdSource,
  MdMic,
  MdMicOff,
  MdVolumeUp,
  MdVolumeOff,
} from "react-icons/md";

const MessageContent = ({ content }) => {
  return (
    <div
      className="prose-dark text-sm leading-relaxed"
      dangerouslySetInnerHTML={{
        __html: content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
          .replace(/^- (.+)$/gm, "• $1")
          .replace(/\n/g, "<br/>"),
      }}
    />
  );
};

const ChatMessage = ({ message, onSpeak }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs ${
          isUser
            ? "bg-brand-600 text-white"
            : "bg-purple-600/30 text-purple-300"
        }`}
      >
        {isUser ? <MdPerson size={16} /> : <MdAutoAwesome size={16} />}
      </div>

      <div
        className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm ${
            isUser
              ? "bg-brand-600 text-white rounded-tr-sm"
              : "bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <MessageContent content={message.content} />
          )}
        </div>

        {!isUser && (
          <button
            onClick={() => onSpeak(message.content)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-brand-400 transition-colors mt-0.5 px-1"
          >
            <MdVolumeUp size={13} /> Read aloud
          </button>
        )}

        {message.sources?.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <MdSource size={11} className="text-slate-600" />
            <span className="text-xs text-slate-600">
              {message.sources.length} source
              {message.sources.length > 1 ? "s" : ""} used
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center">
      <MdAutoAwesome size={16} />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/8">
      <div className="flex gap-1.5 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  </div>
);

const AIChatBox = ({
  messages,
  loading,
  onSend,
  placeholder = "Ask anything...",
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceSupported] = useState(
    () => "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
  );
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Setup speech recognition
  useEffect(() => {
    if (!voiceSupported) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [voiceSupported]);

  const speakText = useCallback(
    (text) => {
      if (!window.speechSynthesis) return;
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const clean = text.replace(/<[^>]*>/g, "").replace(/[•*#]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking],
  );

  // Auto-speak last AI message when new message arrives
  useEffect(() => {
    if (!autoSpeak || loading || messages.length === 0) return;
    if (messages.length <= lastMessageCountRef.current) return;
    lastMessageCountRef.current = messages.length;

    const last = messages[messages.length - 1];
    if (last.role === "assistant") {
      // Small delay to let UI render first
      setTimeout(() => speakText(last.content), 300);
    }
  }, [messages, loading, autoSpeak]);

  const toggleListening = () => {
    if (!voiceSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    if (isListening) recognitionRef.current?.stop();
    onSend(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mb-3">
              <MdAutoAwesome size={24} className="text-brand-400" />
            </div>
            <p className="text-slate-400 font-medium text-sm">
              How can I help you?
            </p>
            <p className="text-slate-600 text-xs mt-1">{placeholder}</p>
            {voiceSupported && (
              <p className="text-slate-700 text-xs mt-2">
                🎤 Voice input · 🔊 Auto-speak enabled
              </p>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} onSpeak={speakText} />
          ))}
        </AnimatePresence>

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/8 bg-surface-900/50"
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setAutoSpeak((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              autoSpeak
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                : "bg-white/5 text-slate-500 border border-white/10"
            }`}
            title="Toggle auto-speak"
          >
            <MdVolumeUp size={13} />
            {autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
            >
              <MdVolumeOff size={13} /> Stop speaking
            </button>
          )}
        </div>

        <div className="flex items-end gap-2">
          {/* Mic button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-brand-400 hover:border-brand-500/30"
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MdMicOff size={17} /> : <MdMic size={17} />}
            </button>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "🎤 Listening..." : placeholder}
            rows={1}
            disabled={disabled || loading}
            className={`flex-1 bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none transition-colors disabled:opacity-50 max-h-32 leading-5 ${
              isListening
                ? "border-red-500/50 focus:border-red-500/70"
                : "border-white/10 focus:border-brand-500/50"
            }`}
            style={{ height: "auto", minHeight: "40px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading || disabled}
            className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <MdSend size={17} />
          </button>
        </div>
        <p className="text-xs text-slate-700 mt-1.5 px-1">
          Enter to send · Shift+Enter for new line{" "}
          {voiceSupported && "· 🎤 Mic for voice input"}
        </p>
      </form>
    </div>
  );
};

export default AIChatBox;
