import axios, { AxiosResponse } from 'axios';
import { Image, ImagesResponse, CreateImageDto, UpdateImageDto, ImageUploadResponse } from '@/types/image';
import { MCPRequest, ChatResponse } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth headers if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Images API
  images: {
    // Get all images with pagination
    getAll: async (params: { page?: number; limit?: number } = {}): Promise<ImagesResponse> => {
      try {
        const response: AxiosResponse<ImagesResponse> = await apiClient.get('/images', { params });
        // Ensure we always return a valid structure
        return response.data || {
          images: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 12,
          totalPages: 0,
        };
      } catch (error) {
        // Log errors in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('API: Error fetching images:', error);
        }
        // Return fallback data on error
        return {
          images: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 12,
          totalPages: 0,
        };
      }
    },

    // Get single image by ID
    getById: async (id: string): Promise<Image> => {
      try {
        const response: AxiosResponse<Image> = await apiClient.get(`/images/${id}`);
        return response.data;
      } catch (error) {
        throw error; // Re-throw for proper error handling in components
      }
    },

    // Upload new image
    upload: async (data: CreateImageDto): Promise<ImageUploadResponse> => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      const response: AxiosResponse<ImageUploadResponse> = await apiClient.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    // Upload new image with FormData (for chat uploads)
    uploadFormData: async (formData: FormData): Promise<ImageUploadResponse> => {
      const response: AxiosResponse<ImageUploadResponse> = await apiClient.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    // Update image metadata
    update: async (id: string, data: UpdateImageDto): Promise<Image> => {
      const response: AxiosResponse<Image> = await apiClient.patch(`/images/${id}`, data);
      return response.data;
    },

    // Delete image
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/images/${id}`);
    },

    // Get download URL for image
    getDownloadUrl: async (id: string): Promise<{ downloadUrl: string }> => {
      const response: AxiosResponse<{ downloadUrl: string }> = await apiClient.get(`/images/${id}/download`);
      return response.data;
    },

    // Search images
  },

  // MCP Chat API
  mcp: {
    // Send message to MCP server
    sendMessage: async (request: MCPRequest): Promise<ChatResponse> => {
      const response: AxiosResponse<ChatResponse> = await apiClient.post('/mcp/chat', request);
      return response.data;
    },

    // Get chat history (if implemented)
    getHistory: async (): Promise<ChatResponse[]> => {
      const response: AxiosResponse<ChatResponse[]> = await apiClient.get('/mcp/history');
      return response.data;
    },
  },

  // Notifications API
  notifications: {
    // Get notification stream URL
    getStreamUrl: (): string => {
      return `${API_BASE_URL}/notifications/stream`;
    },

    // Get recent notifications
    getRecent: async (): Promise<any[]> => {
      const response: AxiosResponse<any[]> = await apiClient.get('/notifications');
      return response.data;
    },
  },

  // Health check
  health: async (): Promise<{ status: string; timestamp: string }> => {
    const response: AxiosResponse<{ status: string; timestamp: string }> = await apiClient.get('/health');
    return response.data;
  },
};

export default api;
