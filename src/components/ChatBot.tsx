import React, { useState, useRef, useEffect } from "react";
import { IconMusic, IconSettings, IconX } from "@tabler/icons-react";

interface Message {
  id?: string | number;
  role: string;
  content: string;
  created_at?: string;
}

interface Session {
  id: string;
  name?: string;
  created_at?: string;
  messages: Message[];
}

const API_URL = import.meta.env.VITE_API_URL;

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // ── On mount: identify user via cookie, load their sessions ───────────────
  useEffect(() => {
    loadChatHistory().then();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);

      const res = await fetch(`${API_URL}/api/chat/history`, {
        credentials: "include", // ✅ cookie is sent — backend knows who the user is
      });

      // Not logged in
      if (res.status === 401) {
        setIsLoadingHistory(false);
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      const fetchedSessions: Session[] = data.sessions || [];
      setSessions(fetchedSessions);

      // ✅ Just load the most recent session — no localStorage needed
      if (fetchedSessions.length > 0) {
        const latest = fetchedSessions[0];
        setSessionId(String(latest.id));
        setMessages(latest.messages || []);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const switchSession = (session: Session) => {
    setSessionId(String(session.id));
    setMessages(session.messages || []);
    setShowSessions(false);
  };

  const startNewSession = () => {
    // ✅ Just clear state — next message will create a new session on the backend
    setSessionId(null);
    setMessages([]);
    setShowSessions(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ cookie authenticates the user
        body: JSON.stringify({
          message: currentInput,
          session_id: sessionId, // null = backend creates a new session
        }),
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const data = await res.json();

      if (data.success) {
        // ✅ Keep track of session id returned by backend (string-coerced)
        if (data.session_id) {
          setSessionId(String(data.session_id));
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);

        // Refresh sessions list in background so History panel stays up to date
        loadChatHistory();
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm max-h-48 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-1">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No past conversations</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => switchSession(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    String(s.id) === sessionId
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="font-medium">
                    {s.name ||
                      `Chat ${new Date(s.created_at || "").toLocaleDateString()}`}
                  </span>
                  <span className="text-gray-400 ml-2 text-xs">
                    ({s.messages?.length || 0} messages)
                  </span>
                </button>
              ))
            )}
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
            {sessionId && (
              <p className="text-xs text-gray-400 mt-1">
                Session: <span className="font-mono">{sessionId}</span>
              </p>
            )}
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
                Ask me to find songs by mood, genre, or artist — in any
                language!
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Try: "Find me some happy songs"</p>
                <p>Try: "Montre-moi des chansons rock" 🇫🇷</p>
                <p>Try: "Canciones románticas" 🇪🇸</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {msg.content}
                  </div>
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
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to find songs... in any language! 🌍"
              disabled={isLoading || isLoadingHistory}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
    </div>
  );
};