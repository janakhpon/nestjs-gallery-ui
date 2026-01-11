"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageType } from "@/types/image";
import { formatFileSize, formatDate, cn } from "@/lib/utils";
import { useImageDownloadUrl } from "@/hooks/useImages";
import {
  X,
  Download,
  Calendar,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImageModalProps {
  image: ImageType;
  onClose: () => void;
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: downloadData, isLoading: downloadLoading } =
    useImageDownloadUrl(image.id);

  const handleDownload = async () => {
    if (downloadData?.downloadUrl) {
      try {
        const response = await fetch(downloadData.downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = image.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Download started!");
      } catch {
        toast.error("Failed to download image");
      }
    }
  };

  const handleCopyUrl = async () => {
    if (!image.s3Url) return;
    try {
      await navigator.clipboard.writeText(image.s3Url);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200">
        {/* Image Section - Main Focus */}
        <div className="relative flex-1 bg-gray-50 flex items-center justify-center min-h-[300px] lg:min-h-0 p-4 lg:p-12 overflow-hidden group">
          {/* Close button for mobile - Overlay */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full lg:hidden hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          )}

          {imageError ||
          (!image.s3Url &&
            image.status !== "PENDING" &&
            image.status !== "PROCESSING") ? (
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Preview unavailable</p>
            </div>
          ) : (
            image.s3Url && (
              <div className="relative w-full h-full">
                <Image
                  src={image.s3Url}
                  alt={image.title || image.originalName}
                  fill
                  unoptimized
                  className={cn(
                    "object-contain transition-all duration-300",
                    !imageLoaded
                      ? "opacity-0 scale-95"
                      : "opacity-100 scale-100"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            )
          )}
        </div>

        {/* Sidebar - Details */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white border-l border-gray-100 h-[50vh] lg:h-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-bold text-gray-900 leading-snug break-words">
                {image.title || image.originalName}
              </h2>
              <div className="flex items-center mt-2 space-x-2">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    image.status === "READY"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {image.status}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {formatFileSize(image.size)}
                </span>
              </div>
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden lg:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {image.description && (
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
                {image.description}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center">
                <Info className="w-3 h-3 mr-2" />
                Metadata
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                    Created
                  </p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {formatDate(image.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                    Dimensions
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {image.width && image.height
                      ? `${image.width} × ${image.height}`
                      : "Unknown"}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                    Original Filename
                  </p>
                  <p className="text-sm font-medium text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded w-fit max-w-full truncate">
                    {image.originalName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
            <button
              onClick={handleDownload}
              disabled={downloadLoading || !downloadData?.downloadUrl}
              className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              {downloadLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </>
              )}
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyUrl}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </>
                )}
              </button>

              <a
                href={image.s3Url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
