"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageType } from "@/types/image";
import { formatFileSize, formatRelativeTime, cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";

interface ImageCardProps {
  image: ImageType;
  onClick: () => void;
  onDelete?: (imageId: string) => void;
  className?: string;
}

export function ImageCard({
  image,
  onClick,
  onDelete,
  className,
}: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
        "border border-gray-100 hover:border-gray-200",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]",
        className
      )}
      onClick={onClick}
    >
      {/* Image Aspect Ratio Container */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-black/60 rounded-full animate-spin"></div>
          </div>
        )}

        {imageError ||
        (!image.s3Url &&
          image.status !== "PENDING" &&
          image.status !== "PROCESSING") ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-300">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-xl">!</span>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider">
              Failed to load
            </p>
          </div>
        ) : (
          image.s3Url && (
            <Image
              src={image.s3Url}
              alt={image.title || image.originalName}
              fill
              unoptimized
              className={cn(
                "object-cover transition-transform duration-700 ease-out will-change-transform",
                "group-hover:scale-105",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )
        )}

        {/* Status Badge - Minimalist Dot */}
        {image.status !== "READY" && (
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md",
                image.status === "FAILED"
                  ? "bg-red-500/90 text-white"
                  : "bg-gray-500/90 text-white"
              )}
            >
              {image.status}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button className="bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 backdrop-blur-sm">
              <Eye className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete image?")) onDelete(image.id);
                }}
                className="bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-600 p-2.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Content - Clean Typography */}
      <div className="p-4">
        <h3
          className="font-medium text-gray-900 truncate text-sm mb-1.5"
          title={image.title || image.originalName}
        >
          {image.title || image.originalName}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
          <span>{formatFileSize(image.size)}</span>
          <span>{formatRelativeTime(image.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
