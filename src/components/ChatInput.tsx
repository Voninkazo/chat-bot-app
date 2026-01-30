import React from "react";
import { IconSend } from "@tabler/icons-react";

export const ChatInput = ({ sendMessage, inputValue, setInputValue }) => {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4">
      <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <IconSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};