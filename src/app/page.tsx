"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ImageGrid } from "@/components/gallery/ImageGrid";
import { UploadButton } from "@/components/gallery/UploadButton";
import dynamic from "next/dynamic";
import { useNotifications } from "@/hooks/useNotifications";
import { MessageCircle, Grid3X3 } from "lucide-react";

const ChatBot = dynamic(
  () => import("@/components/chat/ChatBot").then((mod) => mod.ChatBot),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function GalleryPage() {
  const [showChat, setShowChat] = useState(false);

  // Real-time notifications
  const { isConnected, testConnection } = useNotifications();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-300">
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Connection Status - Mobile: Dot only, Desktop: Full badge */}
              <div className="flex items-center">
                {isConnected ? (
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                    <span className="hidden sm:inline">System Live</span>
                  </div>
                ) : (
                  <button
                    onClick={testConnection}
                    className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
                    <span className="hidden sm:inline">Offline</span>
                    <span className="sm:hidden">Retry</span>
                  </button>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />

              {/* Upload Button */}
              <UploadButton />

              {/* Chat Toggle - Icon only */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-sm border ${
                  showChat
                    ? "bg-black text-white border-transparent hover:bg-gray-800"
                    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
                aria-label="Toggle Assistant"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 min-h-screen">
        <ImageGrid />
      </main>

      {/* Chat Bot */}
      {showChat && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Mobile Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm sm:hidden"
            onClick={() => setShowChat(false)}
          />
          <div className="absolute inset-x-0 bottom-0 top-12 sm:top-auto sm:relative sm:w-[400px] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <ChatBot onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "text-sm font-medium text-gray-900",
          style: {
            background: "white",
            border: "1px solid #E5E7EB",
            padding: "12px 16px",
            color: "#111827",
            borderRadius: "12px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
}
