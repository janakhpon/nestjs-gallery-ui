'use client';

import React from 'react';
import { Image } from '@/types/image';
import { formatFileSize, formatRelativeTime, getImageStatusColor, getImageStatusIcon, cn } from '@/lib/utils';
import { Eye, Download, Calendar, FileText, Trash2 } from 'lucide-react';

interface ImageCardProps {
  image: Image;
  onClick: () => void;
  onDelete?: (imageId: string) => void;
  className?: string;
}

export function ImageCard({ image, onClick, onDelete, className }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className || ''}`}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        ) : (
          <img
            src={image.s3Url}
            alt={image.title || image.originalName}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getImageStatusColor(image.status)
            )}
          >
            <span className="mr-1">{getImageStatusIcon(image.status)}</span>
            {image.status}
          </span>
        </div>

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <Eye className="w-4 h-4 text-gray-700" />
                </div>
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <Download className="w-4 h-4 text-gray-700" />
                </div>
              </div>
              {/* Delete Button */}
              {onDelete && (
                <div className="flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${image.title || image.originalName}"?`)) {
                        onDelete(image.id);
                      }
                    }}
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {image.title || image.originalName}
        </h3>
        {image.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {image.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(image.createdAt)}</span>
          </div>
          <span>{formatFileSize(image.size)}</span>
        </div>

        {/* Dimensions */}
        {image.width && image.height && (
          <div className="mt-2 text-xs text-gray-500">
            {image.width} × {image.height}
          </div>
        )}
      </div>
    </div>
  );
}
