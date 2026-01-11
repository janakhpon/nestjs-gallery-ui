'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Image, CreateImageDto, UpdateImageDto } from '@/types/image';
import toast from 'react-hot-toast';

export function useImages(page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: ['images', page, limit],
    queryFn: () => api.images.getAll({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Poll every 3 seconds if any image is processing
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.images) return false;
      const hasPending = data.images.some(
        (image: Image) =>
          image.status === "PENDING" || image.status === "PROCESSING"
      );
      return hasPending ? 3000 : false;
    },
    // Provide fallback data structure
    placeholderData: (previousData) =>
      previousData || {
        images: [] as Image[],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      },
  });
}

export function useImage(id: string) {
  return useQuery({
    queryKey: ["images", id],
    queryFn: () => api.images.getById(id),
    enabled: !!id,
    // Poll every 3 seconds if image is processing
    refetchInterval: (query) => {
      const image = query.state.data as Image | undefined;
      if (!image) return false;
      return image.status === "PENDING" || image.status === "PROCESSING"
        ? 3000
        : false;
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImageDto) => api.images.upload(data),
    onSuccess: () => {
      toast.success('Image uploaded successfully!');
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Failed to upload image');
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImageDto }) =>
      api.images.update(id, data),
    onSuccess: (data, variables) => {
      toast.success('Image updated successfully!');
      // Update the specific image in cache
      queryClient.setQueryData(['images', variables.id], data);
      // Invalidate images list to refetch
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Failed to update image');
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.images.delete(id),
    onSuccess: (_, id) => {
      toast.success('Image deleted successfully!');
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['images', id] });
      // Invalidate images list to refetch
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Failed to delete image');
    },
  });
}

export function useImageDownloadUrl(id: string) {
  return useQuery({
    queryKey: ['images', id, 'download'],
    queryFn: () => api.images.getDownloadUrl(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
