"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { formatDate } from "@/lib/utils";
import { User, Bot, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isSystem) {
    return (
      <div className={`flex justify-center py-4 ${className || ""}`}>
        <div className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border border-gray-100">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 py-1 ${isUser ? "flex-row-reverse" : "flex-row"} ${
        className || ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
          isUser ? "bg-black" : "bg-gray-100"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] ${
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`group relative px-4 py-3 rounded-2xl transition-all duration-200 ${
            isUser
              ? "bg-black text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser
                ? "text-white/50 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Timestamp & Metadata */}
        <div
          className={`flex items-center space-x-2 mt-1.5 px-1 ${
            isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
          }`}
        >
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
            {formatDate(message.timestamp)}
          </span>
          {message.metadata?.action && (
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              • {message.metadata.action}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
