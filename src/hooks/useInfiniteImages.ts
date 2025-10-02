'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ImagesResponse } from '@/types/image';

export function useInfiniteImages(limit: number = 6) {
  return useInfiniteQuery({
    queryKey: ['images', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => api.images.getAll({ page: pageParam, limit }),
    getNextPageParam: (lastPage: ImagesResponse) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
