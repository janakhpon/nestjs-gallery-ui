'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { formatDate } from '@/lib/utils';
import { User, Bot, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Message copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  if (isSystem) {
    return (
      <div className={`flex justify-center py-2 ${className || ''}`}>
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 py-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } ${className || ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${
        isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
      }`}>
        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-md' 
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser 
                ? 'text-blue-100 hover:text-white hover:bg-blue-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {formatDate(message.timestamp)}
        </div>

        {/* Metadata */}
        {message.metadata && (
          <div className="mt-2 text-xs text-gray-400">
            {message.metadata.action && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                Action: {message.metadata.action}
              </span>
            )}
            {message.metadata.imageId && (
              <span className="bg-gray-100 px-2 py-1 rounded ml-2">
                Image ID: {message.metadata.imageId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
