'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useMCPChat } from '@/hooks/useMCPChat';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { X, MessageCircle, Bot, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ChatBotProps {
  onClose: () => void;
  className?: string;
}

export function ChatBot({ onClose, className }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, uploadImageViaChat, isConnected, isLoading, testConnection } = useMCPChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection when component mounts
  useEffect(() => {
    const testChatConnection = async () => {
      try {
        await testConnection();
        console.log('Chat connection verified');
      } catch (error) {
        console.error('Chat connection failed:', error);
      }
    };
    
    testChatConnection();
  }, [testConnection]);

  // Add welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      role: 'system',
      content: 'Welcome! I can help you manage your gallery. Try asking me to show images, upload new ones, or get information about your photos.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: file ? `Upload image: ${file.name}` : content,
      timestamp: new Date(),
      metadata: file ? { action: 'upload', fileName: file.name } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let response;
      
      if (file) {
        // Handle file upload
        const title = content.trim() || file.name.split('.')[0];
        const description = content.trim() ? `Uploaded via chat: ${content}` : 'Uploaded via chat assistant';
        
        response = await uploadImageViaChat(file, title, description);
      } else {
        // Handle regular message
        response = await sendMessage(content);
      }
      
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden ${className || ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {/* Connection Status Indicator */}
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )}>
              {isConnected ? (
                <Wifi className="w-2 h-2 text-white m-0.5" />
              ) : (
                <WifiOff className="w-2 h-2 text-white m-0.5" />
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gallery Assistant</h3>
            <p className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Assistant is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading || !isConnected}
          placeholder={!isConnected ? "Connecting to assistant..." : "Ask me anything about your gallery..."}
        />
      </div>
    </div>
  );
}
