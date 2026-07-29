import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  IconSettings,
  IconX,
  IconTrash,
  IconCopy,
  IconCheck,
  IconRobot,
  IconArrowDown,
  IconPlus,
  IconMessage,
} from "@tabler/icons-react";
import { toast } from "sonner";
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

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      title="Copy message"
    >
      {copied ? (
        <>
          <IconCheck size={13} className="text-green-500" />
          <span className="text-green-500">Copied</span>
        </>
      ) : (
        <>
          <IconCopy size={13} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    loadChatHistory().then();
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight      < 80);
    };
    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  };

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    const next = Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT);
    element.style.height = `${next}px`;
    element.style.overflowY =
      element.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [input]);

  const loadChatHistory = async (): Promise<void> => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_URL}/api/chat/history`, {
        credentials: "include",
      });
      if (response.status === 401) return;
      if (!response.ok) {
        console.error("Failed to load chat history:", response.status);
        return;
      }
      const { sessions = [] }: { sessions?: Session[] } = await response.json();
      setSessions(sessions);
      if (sessions.length > 0) {
        const [latest] = sessions;
        setSessionId(String(latest.id));
        setMessages(latest.messages ?? []);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const switchSession = (session: Session) => {
    setSessionId(String(session.id));
    setMessages(session.messages || []);
    setConfirmDeleteId(null);
  };

  const startNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setConfirmDeleteId(null);
  };

  const deleteSession = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/chat/session/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Failed to delete conversation. Please try again.");
        return;
      }
      if (id === sessionId) {
        setSessionId(null);
        setMessages([]);
      }
      await loadChatHistory();
    } catch {
      toast.error("Something went wrong while deleting. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const sendMessage = async (): Promise<void> => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: MessageProps = {
      id: crypto.randomUUID(),
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
        body: JSON.stringify({ message: trimmedInput, session_id: sessionId }),
      });

      if (!response.ok) {
        toast.error("Failed to send message. Please try again.");
        return;
      }

      const data: {
        success: boolean;
        response?: string;
        error?: string;
        session_id?: string | number;
      } = await response.json();

      if (!data.success) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.session_id) setSessionId(String(data.session_id));

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.response ?? "" },
      ]);

      void loadChatHistory();
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  const formatSessionTitle = (session: Session) =>
    session.name ||
    `Chat ${new Date(session.created_at || "").toLocaleDateString()}`;

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Left Sidebar ── */}
      <div className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Branding */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
          <IconRobot className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">AI Assistant</span>
        </div>

        {/* New Chat */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={startNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <IconPlus size={16} />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {isLoadingHistory ? (
            <div className="px-3 py-4 text-center text-xs text-gray-400">
              Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-gray-400">
              No conversations yet
            </div>
          ) : (
            sessions.map((s) =>
              confirmDeleteId === String(s.id) ? (
                // Inline delete confirmation
                <div key={s.id} className="px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs text-gray-600 mb-2 truncate">
                    Delete &ldquo;{formatSessionTitle(s)}&rdquo;?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => deleteSession(String(s.id))}
                      disabled={isDeleting}
                      className="flex-1 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? "…" : "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={s.id}
                  className={`group flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    String(s.id) === sessionId
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <IconMessage
                    size={14}
                    className={`shrink-0 ${String(s.id) === sessionId ? "text-blue-500" : "text-gray-400"}`}
                  />
                  <button
                    onClick={() => switchSession(s)}
                    className="flex-1 text-left text-sm truncate min-w-0"
                    title={formatSessionTitle(s)}
                  >
                    {formatSessionTitle(s)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(String(s.id));
                    }}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                    title="Delete"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="relative flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-end shadow-sm">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <IconSettings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-4">
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
        )}

        {!isLoadingHistory && messages.length === 0 ? (
          /* ── Empty state: centered input ── */
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
            <IconRobot className="w-16 h-16 mb-4 text-blue-400" />
            <p className="text-xl font-semibold text-gray-700 mb-2">
              How can I help you today?
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Ask me anything — coding, science, language, music, and more.
            </p>
            <div className="w-full max-w-2xl flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Shift+Enter for new line)"
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none leading-relaxed shadow-sm"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          /* ── Active conversation ── */
          <>
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto px-4 py-6 flex-1"
            >
              <div className="max-w-3xl mx-auto space-y-4">
                {isLoadingHistory ? (
                  <div className="text-center text-gray-400 mt-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-sm">Loading your conversations…</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="flex flex-col gap-1 max-w-2xl">
                          <div className="flex items-center gap-1.5 px-1">
                            <IconRobot size={14} className="text-blue-500" />
                            <span className="text-xs font-medium text-gray-400">
                              Assistant
                            </span>
                          </div>
                          <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
                            <MarkdownMessage content={msg.content} />
                          </div>
                          <div className="flex items-center pl-1">
                            <CopyButton text={msg.content} />
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-2xl px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-br-sm">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}
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
                        <span className="text-sm">Thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Scroll to bottom */}
            {!isAtBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-md text-sm text-gray-600 rounded-full hover:bg-gray-50 transition-all"
              >
                <IconArrowDown size={15} />
                <span>Scroll to latest</span>
              </button>
            )}

            {/* Input pinned to bottom */}
            <div className="border-t border-gray-200 bg-white px-4 py-4">
              <div className="max-w-3xl mx-auto flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything… (Shift+Enter for new line)"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none leading-relaxed"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
