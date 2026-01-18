'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MCPRequest, ChatResponse } from '@/types/chat';
import toast from 'react-hot-toast';

export function useMCPChat() {
  const [isConnected, setIsConnected] = useState(true); // Start as connected since we have the endpoint

  const sendMessageMutation = useMutation({
    mutationFn: (request: MCPRequest) => api.mcp.sendMessage(request),
    onSuccess: () => {
      setIsConnected(true);
    },
    onError: (error: unknown) => {
      // Log errors in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('MCP message failed:', error);
      }
      setIsConnected(false);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const sendMessage = useCallback(async (message: string, provider?: 'openai' | 'gemini'): Promise<ChatResponse> => {
    try {
      const request: MCPRequest = {
        message,
        context: {
          // Add any context here if needed
        },
        provider,
      };

      const response = await sendMessageMutation.mutateAsync(request);
      return response;
    } catch (error) {
      throw error;
    }
  }, [sendMessageMutation]);

  const uploadImageViaChat = useCallback(async (file: File, title: string, description: string, provider?: 'openai' | 'gemini'): Promise<ChatResponse> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      // Upload the image using the FormData upload endpoint
      const uploadResponse = await api.images.uploadFormData(formData);

      // Send a confirmation message to the chat
      // Send a confirmation message to the chat
      const message = `I've just uploaded an image named "${file.name}" with the title "${title}". Description: "${description}". Please acknowledge this upload.`;

      const chatResponse = await sendMessage(message, provider);

      return {
        ...chatResponse,
        metadata: {
          ...chatResponse.metadata,
          uploadResponse,
          action: 'image_uploaded'
        }
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Failed to upload image via chat:', axiosError);

      // Extract meaningful error message
      let errorMessage = 'Unknown error occurred';
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      const chatErrorMessage = `Failed to upload image: ${errorMessage}`;
      await sendMessage(chatErrorMessage, provider);
      throw error;
    }
  }, [sendMessage]);

  const searchImages = useCallback(async (query: string): Promise<ChatResponse> => {
    try {
      const searchMessage = `Search for images: ${query}`;
      const response = await sendMessage(searchMessage);
      return response;
    } catch (error) {
      throw error;
    }
  }, [sendMessage]);

  const testConnection = useCallback(async () => {
    try {
      const response = await api.mcp.sendMessage({ message: 'test', context: {} });
      setIsConnected(true);
      return response;
    } catch (error) {
      setIsConnected(false);
      throw error;
    }
  }, []);

  return {
    sendMessage,
    uploadImageViaChat,
    searchImages,
    testConnection,
    isConnected,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
