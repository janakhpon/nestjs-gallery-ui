'use client';

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { ChatBot } from '@/components/chat/ChatBot';
import { useNotifications } from '@/hooks/useNotifications';
import { MessageCircle, Grid3X3, Wifi, WifiOff } from 'lucide-react';

export default function GalleryPage() {
  const [showChat, setShowChat] = useState(false);
  
  // Real-time notifications
  const { isConnected, connectionAttempts, testConnection } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-4 h-4 mr-1" />
                      <span>Disconnected</span>
                    </div>
                    {connectionAttempts > 0 && (
                      <span className="text-xs text-gray-500">
                        ({connectionAttempts}/5)
                      </span>
                    )}
                    <button
                      onClick={testConnection}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      title="Test connection"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Toggle */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showChat 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{showChat ? 'Hide Chat' : 'Open Chat'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageGrid />
      </main>

      {/* Chat Bot */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
          <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}