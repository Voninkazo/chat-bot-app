import React, { useState, useRef, useEffect } from "react";
import {IconMusic, IconSettings, IconX} from "@tabler/icons-react";

interface Message {
  role: string;
  content: string;
}



const Button = ({ onClick, className, children }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:3001");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Make sure your backend server is running at ${apiUrl}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex max-h-screen  flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <IconMusic className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">
            Music Search Assistant
          </h1>
        </div>
        <Button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconSettings className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

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
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backend API URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:3001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make sure your backend server is running
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <IconMusic className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <p className="text-lg mb-2">Welcome to Music Search Assistant!</p>
              <p className="text-sm mb-4">
                Ask me to find songs by mood, genre, or artist
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Try: "Find me some happy songs"</p>
                <p>Try: "Show me rock songs"</p>
                <p>Try: "Songs by [artist name]"</p>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                }`}
              >
                <div
                  className="prose prose-sm max-w-none">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Searching for songs...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ChatInput Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to find songs... (e.g., 'happy songs' or 'rock music')"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}