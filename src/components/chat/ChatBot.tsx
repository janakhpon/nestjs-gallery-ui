"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useMCPChat } from "@/hooks/useMCPChat";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { X, Bot, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ChatBotProps {
  onClose: () => void;
  className?: string;
}

export function ChatBot({ onClose, className }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");

  const {
    sendMessage,
    uploadImageViaChat,
    isConnected,
    isLoading,
    testConnection,
  } = useMCPChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection when component mounts
  useEffect(() => {
    const testChatConnection = async () => {
      try {
        await testConnection();
      } catch (error) {
        console.error("Chat connection failed:", error);
      }
    };

    testChatConnection();
  }, [testConnection]);

  // Add welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: "welcome",
      role: "system",
      content: "Assistant ready. I can help list, search, or upload images.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: file ? `Upload: ${file.name}` : content,
      timestamp: new Date(),
      metadata: file ? { action: "upload", fileName: file.name } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      let response;

      if (file) {
        const title = content.trim() || file.name.split(".")[0];
        const description = content.trim()
          ? `Uploaded via assistant: ${content}`
          : "Uploaded via assistant";

        response = await uploadImageViaChat(file, title, description, provider);
      } else {
        response = await sendMessage(content, provider);
      }

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Request failed. Please check your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("History cleared");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white sm:rounded-2xl overflow-hidden",
        "border-t sm:border border-gray-100",
        "shadow-none sm:shadow-2xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            {/* Connection Status Indicator */}
            <div
              className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                isConnected ? "bg-green-500" : "bg-gray-300",
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 leading-none">
              Assistant
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
              {isConnected ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button
              onClick={() => setProvider("openai")}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md transition-all duration-200",
                provider === "openai"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900",
              )}
            >
              OpenAI
            </button>
            <button
              onClick={() => setProvider("gemini")}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md transition-all duration-200",
                provider === "gemini"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900",
              )}
            >
              Gemini
            </button>
          </div>

          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-gray-400 py-2 ml-1">
            <div className="flex space-x-1 p-2 bg-gray-200/50 rounded-full">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !isConnected}
          placeholder={!isConnected ? "Connecting..." : "Ask assistant..."}
        />
      </div>
    </div>
  );
}
