'use client';

import React, { useState } from 'react';
import { useImages } from '@/hooks/useImages';
import { useInfiniteImages } from '@/hooks/useInfiniteImages';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ImageCard } from './ImageCard';
import { ImageModal } from './ImageModal';
import { Pagination } from './Pagination';
import { Image } from '@/types/image';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ImageGridProps {
  className?: string;
}

export function ImageGrid({ className }: ImageGridProps) {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const limit = 6;
  const isMobile = useIsMobile();

  // Use different hooks based on device type
  const { data, isLoading, error } = useImages(page, limit);
  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    error: infiniteError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteImages(limit);
  
  const queryClient = useQueryClient();

  // Use infinite scroll hook for mobile
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    isFetchingNextPage: isFetchingNextPage || false,
    fetchNextPage: fetchNextPage,
  });

  // Flatten infinite data for mobile
  const allImages = isMobile && infiniteData 
    ? infiniteData.pages.flatMap(page => page.images)
    : data?.images || [];

  const currentData = isMobile ? infiniteData : data;
  const currentLoading = isMobile ? infiniteLoading : isLoading;
  const currentError = isMobile ? infiniteError : error;

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await api.images.delete(imageId);
      toast.success('Image deleted successfully');
      
      // Invalidate and refetch images for both modes
      queryClient.invalidateQueries({ queryKey: ['images'] });
      
      // Close modal if the deleted image was selected
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  if (currentLoading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load images
        </h3>
        <p className="text-gray-600 mb-4">
          There was an error loading your gallery. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!allImages || allImages.length === 0) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No images found
        </h3>
        <p className="text-gray-600">
          Upload your first image to get started with your gallery.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className || ''}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {allImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => handleImageClick(image)}
            onDelete={handleDeleteImage}
          />
        ))}
      </div>

      {/* Pagination (Desktop) / Infinite Scroll (Mobile) */}
      {!isMobile && data && data.totalPages && data.totalPages > 1 && (
        <div className="px-4 sm:px-0">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            totalItems={data.total || 0}
            itemsPerPage={limit}
          />
        </div>
      )}

      {/* Infinite Scroll Load More (Mobile) */}
      {isMobile && (
        <div className="px-4 sm:px-0">
          {/* Load more trigger */}
          <div ref={loadMoreRef} className="h-4" />
          
          {/* Loading indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more images...</span>
              </div>
            </div>
          )}
          
          {/* End of results */}
          {!hasNextPage && allImages.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You've reached the end! 🎉</p>
              <p className="text-sm mt-1">All {allImages.length} images loaded</p>
            </div>
          )}
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
