import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { IconMusic, IconSettings, IconX, IconTrash } from "@tabler/icons-react";
import { MarkdownMessage } from "./MarkdownMessage";

interface MessageProps {
  id?: string | number;
  role: string;
  content: string;
  created_at?: string;
}

interface Session {
  id: string;
  name?: string;
  created_at?: string;
  messages: MessageProps[];
}

const API_URL = import.meta.env.VITE_API_URL;
const MAX_TEXTAREA_HEIGHT = 200;

export const ChatBot = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChatHistory().then();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Grow the textarea as the user types, up to a max of 200px.
  // Reset to one line when input is cleared (after send).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY =
      el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [input]);

  const loadChatHistory = async (): Promise<void> => {
    setIsLoadingHistory(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/history`, {
        credentials: "include",
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        console.error("Failed to load chat history:", response.status);
        return;
      }

      const { sessions = [] }: { sessions?: Session[] } = await response.json();
      setSessions(sessions);

      if (sessions.length > 0) {
        const [latestSession] = sessions;
        setSessionId(String(latestSession.id));
        setMessages(latestSession.messages ?? []);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }

    setIsLoadingHistory(false);
  };

  const switchSession = (session: Session) => {
    setSessionId(String(session.id));
    setMessages(session.messages || []);
    setShowSessions(false);
  };

  const startNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setShowSessions(false);
  };

  const deleteSession = async (session_id: string): Promise<void> => {
    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat/session/${session_id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        console.error("Failed to delete session:", response.status);
        return;
      }

      if (session_id === sessionId) {
        setSessionId(null);
        setMessages([]);
      }

      await loadChatHistory();
    } catch (error) {
      console.error("Error deleting session:", error);
    }

    setIsDeleting(false);
    setConfirmDeleteId(null);
  };

  const deleteAllSessions = async (): Promise<void> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/history/all`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to delete all sessions:", response.status);
        return;
      }

      setSessionId(null);
      setMessages([]);
      setSessions([]);
      setShowSessions(false);
    } catch (error) {
      console.error("Error deleting all sessions:", error);
    }

    setIsDeleting(false);
    setConfirmDeleteAll(false);
  };

  const sendMessage = async (): Promise<void> => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) return;

    const userMessage: MessageProps = {
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: trimmedInput,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.error("Chat API error:", response.status);
        return;
      }

      const data: {
        success: boolean;
        response?: string;
        error?: string;
        session_id?: string | number;
      } = await response.json();

      if (!data.success) {
        console.error("API logical error:", data.error);
        return;
      }

      if (data.session_id) {
        setSessionId(String(data.session_id));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response ?? "",
        },
      ]);

      void loadChatHistory();
    } catch (error) {
      console.error("Send message failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  return (
    <div className="flex max-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <IconMusic className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">
            Music Search Assistant
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
          >
            History ({sessions.length})
          </button>
          <button
            onClick={startNewSession}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + New Chat
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconSettings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sessions Panel */}
      {showSessions && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm max-h-64 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Delete All button */}
            {sessions.length > 0 && (
              <div className="flex justify-end mb-2">
                {confirmDeleteAll ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Delete all conversations?
                    </span>
                    <button
                      onClick={deleteAllSessions}
                      disabled={isDeleting}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete all"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAll(false)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteAll(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <IconTrash className="w-3 h-3" />
                    Clear all history
                  </button>
                )}
              </div>
            )}

            {/* Session list */}
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">
                  No past conversations
                </p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      String(s.id) === sessionId
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Session name — click to open */}
                    <button
                      onClick={() => switchSession(s)}
                      className={`flex-1 text-left text-sm ${
                        String(s.id) === sessionId
                          ? "text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {s.name ||
                        `Chat ${new Date(s.created_at || "").toLocaleDateString()}`}
                      <span className="text-gray-400 ml-2 text-xs">
                        ({s.messages?.length || 0} messages)
                      </span>
                    </button>

                    {/* ✅ Per-session delete with confirmation */}
                    {confirmDeleteId === String(s.id) ? (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => deleteSession(String(s.id))}
                          disabled={isDeleting}
                          className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(String(s.id))}
                        className="ml-2 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete this conversation"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-blue-100 rounded"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Connected to:{" "}
              <span className="font-mono text-blue-700">{API_URL}</span>
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="overflow-y-auto px-4 py-6 flex-1">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoadingHistory ? (
            <div className="text-center text-gray-400 mt-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm">Loading your conversations...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <IconMusic className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <p className="text-lg mb-2">Welcome to Music Search Assistant!</p>
              <p className="text-sm mb-4">
                Ask me to find songs in any language
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    // Render AI responses as markdown (supports code, lists, headings, etc.)
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    // User messages are plain text — preserve line breaks
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        {/* items-end keeps the Send button pinned to the bottom as the textarea grows */}
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            disabled={isLoading || isLoadingHistory}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none leading-relaxed"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || isLoadingHistory || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
