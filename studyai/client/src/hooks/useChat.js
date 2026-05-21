// src/hooks/useChat.js
import { useState, useCallback } from "react";
import { aiService } from "../services/aiService";
import toast from "react-hot-toast";

const useChat = (noteId = null) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content, aiModel = "openai") => {
    if (!content.trim()) return;

    // Optimistically add user message
    const userMsg = { role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await aiService.chat({
        message: content,
        chatId,
        noteId,
        aiModel,
      });

      if (data.success) {
        const assistantMsg = {
          role: "assistant",
          content: data.response,
          sources: data.sources || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (!chatId && data.chatId) setChatId(data.chatId);
      }
    } catch (err) {
      toast.error("Failed to get response");
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [chatId, noteId]);

  const loadChat = useCallback(async (id) => {
    try {
      const { data } = await aiService.getChat(id);
      if (data.success) {
        setMessages(data.chat.messages || []);
        setChatId(id);
      }
    } catch {
      toast.error("Failed to load chat");
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatId(null);
  }, []);

  return { messages, loading, chatId, sendMessage, loadChat, clearChat, setMessages };
};

export default useChat;
