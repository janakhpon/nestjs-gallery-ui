"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  Type,
  FileText,
  CloudUpload,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      if (!title) {
        // Humanize filename: "my-image_v2.jpg" -> "My Image V2"
        const cleanName = file.name
          .split(".")[0]
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setTitle(cleanName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await api.images.upload({
        file: selectedFile,
        title: title || selectedFile.name.split(".")[0],
        description: description || "Uploaded via Gallery UI",
      });
      toast.success("Image uploaded successfully!", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      resetState();
      setShowModal(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group flex items-center space-x-2.5 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
      >
        <CloudUpload className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Upload Image</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] m-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Image
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
              <div className="flex flex-col gap-6">
                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "group relative min-h-[180px] border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden bg-gray-50",
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-100"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile && previewUrl ? (
                    <div className="w-full h-full p-4 flex items-center gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <span className="text-xs text-blue-600 font-medium mt-2 inline-block hover:underline">
                          Click to replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SVG, PNG, JPG or GIF (max. 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Type className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Image title"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Description{" "}
                      <span className="text-gray-400 font-normal normal-case ml-1">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add some details..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Image</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
