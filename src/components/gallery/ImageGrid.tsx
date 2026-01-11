"use client";

import React, { useState } from "react";
import { useImages } from "@/hooks/useImages";
import { ImageCard } from "./ImageCard";
import { ImageModal } from "./ImageModal";
import { Pagination } from "./Pagination";
import { Image } from "@/types/image";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ImageGridProps {
  className?: string;
}

export function ImageGrid({ className }: ImageGridProps) {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const limit = 8; // Increased limit for better grid filling

  const { data, isLoading, error } = useImages(page, limit);
  const queryClient = useQueryClient();

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await api.images.delete(imageId);
      toast.success("Image deleted successfully");

      queryClient.invalidateQueries({ queryKey: ["images"] });

      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-8 ${className || ""}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-100 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                <div className="flex justify-between pt-2">
                  <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-24 px-4 text-center ${
          className || ""
        }`}
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to load gallery
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We encountered an issue while fetching your images. Please check your
          connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data?.images || data.images.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-32 px-4 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 ${
          className || ""
        }`}
      >
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
          <ImageIcon className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Gallery is empty
        </h3>
        <p className="text-gray-500 max-w-sm mb-8">
          Upload your first image to get started. You can upload via the button
          above or ask the assistant.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${className || ""}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {data.images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => handleImageClick(image)}
            onDelete={handleDeleteImage}
          />
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages && data.totalPages > 1 && (
        <div className="flex justify-center pt-6 border-t border-gray-100">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            totalItems={data.total || 0}
            itemsPerPage={limit}
            className="max-w-md"
          />
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
