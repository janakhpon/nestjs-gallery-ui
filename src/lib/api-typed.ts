import axios, { AxiosResponse } from 'axios';
import type { paths, components } from '@/types/api';

// Extract types from the generated OpenAPI spec
type Image = components['schemas']['Image'];
type CreateImageDto = components['schemas']['CreateImageDto'];
type UpdateImageDto = components['schemas']['UpdateImageDto'];
type MCPRequest = components['schemas']['MCPRequest'];
type ChatResponse = components['schemas']['ChatResponse'];

// Extract response types for each endpoint
type GetImagesResponse = paths['/api/v1/images']['get']['responses']['200']['content']['application/json'];
type GetImageResponse = paths['/api/v1/images/{id}']['get']['responses']['200']['content']['application/json'];
type CreateImageResponse = paths['/api/v1/images']['post']['responses']['201']['content']['application/json'];
type UpdateImageResponse = paths['/api/v1/images/{id}']['patch']['responses']['200']['content']['application/json'];
type DeleteImageResponse = paths['/api/v1/images/{id}']['delete']['responses']['200']['content']['application/json'];
type GetDownloadUrlResponse = paths['/api/v1/images/{id}/download']['get']['responses']['200']['content']['application/json'];
type HealthResponse = paths['/api/v1/health']['get']['responses']['200']['content']['application/json'];

// Extract query parameters
type GetImagesParams = paths['/api/v1/images']['get']['parameters']['query'];

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

export const typedApi = {
  // Images API with full type safety
  images: {
    // Get all images with pagination - fully typed!
    getAll: async (params: GetImagesParams = {}): Promise<GetImagesResponse> => {
      try {
        const response: AxiosResponse<GetImagesResponse> = await apiClient.get('/images', { params });
        return response.data;
      } catch (error) {
        // Log errors in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('API: Error fetching images:', error);
        }
        throw error;
      }
    },

    // Get single image by ID - fully typed!
    getById: async (id: string): Promise<GetImageResponse> => {
      try {
        const response: AxiosResponse<GetImageResponse> = await apiClient.get(`/images/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Upload new image - fully typed!
    upload: async (data: CreateImageDto & { file: File }): Promise<CreateImageResponse> => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      const response: AxiosResponse<CreateImageResponse> = await apiClient.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    // Upload new image with FormData (for chat uploads) - fully typed!
    uploadFormData: async (formData: FormData): Promise<CreateImageResponse> => {
      const response: AxiosResponse<CreateImageResponse> = await apiClient.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    // Update image metadata - fully typed!
    update: async (id: string, data: UpdateImageDto): Promise<UpdateImageResponse> => {
      const response: AxiosResponse<UpdateImageResponse> = await apiClient.patch(`/images/${id}`, data);
      return response.data;
    },

    // Delete image - fully typed!
    delete: async (id: string): Promise<DeleteImageResponse> => {
      const response: AxiosResponse<DeleteImageResponse> = await apiClient.delete(`/images/${id}`);
      return response.data;
    },

    // Get download URL for image - fully typed!
    getDownloadUrl: async (id: string): Promise<GetDownloadUrlResponse> => {
      const response: AxiosResponse<GetDownloadUrlResponse> = await apiClient.get(`/images/${id}/download`);
      return response.data;
    },
  },

  // MCP Chat API with full type safety
  mcp: {
    // Send message to MCP server - fully typed!
    sendMessage: async (request: MCPRequest): Promise<ChatResponse> => {
      const response: AxiosResponse<ChatResponse> = await apiClient.post('/mcp/chat', request);
      return response.data;
    },
  },

  // Health check - fully typed!
  health: async (): Promise<HealthResponse> => {
    const response: AxiosResponse<HealthResponse> = await apiClient.get('/health');
    return response.data;
  },
};

// Export individual types for use in components
export type {
  Image,
  CreateImageDto,
  UpdateImageDto,
  MCPRequest,
  ChatResponse,
  GetImagesResponse,
  GetImageResponse,
  CreateImageResponse,
  UpdateImageResponse,
  DeleteImageResponse,
  GetDownloadUrlResponse,
  HealthResponse,
  GetImagesParams,
};

export default typedApi;
