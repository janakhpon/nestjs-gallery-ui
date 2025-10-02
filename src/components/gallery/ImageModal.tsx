'use client';

import React, { useState } from 'react';
import { Image } from '@/types/image';
import { formatFileSize, formatDate, getImageStatusColor, getImageStatusIcon } from '@/lib/utils';
import { useImageDownloadUrl } from '@/hooks/useImages';
import { X, Download, Calendar, FileText, ExternalLink, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageModalProps {
  image: Image;
  onClose: () => void;
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { data: downloadData, isLoading: downloadLoading } = useImageDownloadUrl(image.id);

  const handleDownload = async () => {
    if (downloadData?.downloadUrl) {
      try {
        const response = await fetch(downloadData.downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = image.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Download started!');
      } catch (error) {
        toast.error('Failed to download image');
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(image.s3Url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {image.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {image.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
            {/* Image */}
            <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
              {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {imageError ? (
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Failed to load image</p>
                </div>
              ) : (
                <img
                  src={image.s3Url}
                  alt={image.title}
                  className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                    !imageLoaded ? 'opacity-0' : ''
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Details */}
            <div className="w-full lg:w-80 p-6 border-l border-gray-200 overflow-y-auto">
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getImageStatusColor(image.status)}`}
                  >
                    <span className="mr-2">{getImageStatusIcon(image.status)}</span>
                    {image.status}
                  </span>
                </div>

                {/* File Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Name:</span>
                      <span className="text-gray-900 font-mono text-xs">{image.originalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">{formatFileSize(image.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{image.mimeType}</span>
                    </div>
                    {image.width && image.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="text-gray-900">{image.width} × {image.height}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Dates</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-600">Created</div>
                        <div className="text-gray-900">{formatDate(image.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-600">Updated</div>
                        <div className="text-gray-900">{formatDate(image.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleDownload}
                      disabled={downloadLoading || !downloadData?.downloadUrl}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {downloadLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleCopyUrl}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </>
                      )}
                    </button>
                    
                    <a
                      href={image.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
