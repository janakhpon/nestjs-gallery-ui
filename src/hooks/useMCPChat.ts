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
    onError: (error: any) => {
      // Log errors in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('MCP message failed:', error);
      }
      setIsConnected(false);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const sendMessage = useCallback(async (message: string): Promise<ChatResponse> => {
    try {
      const request: MCPRequest = {
        message,
        context: {
          // Add any context here if needed
        },
      };

      const response = await sendMessageMutation.mutateAsync(request);
      return response;
    } catch (error) {
      throw error;
    }
  }, [sendMessageMutation]);

  const uploadImageViaChat = useCallback(async (file: File, title: string, description: string): Promise<ChatResponse> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      // Upload the image using the FormData upload endpoint
      const uploadResponse = await api.images.uploadFormData(formData);
      
      // Send a confirmation message to the chat
      const message = `Image uploaded successfully! Title: "${title}", Description: "${description}"`;
      const chatResponse = await sendMessage(message);
      
      return {
        ...chatResponse,
        metadata: {
          ...chatResponse.metadata,
          uploadResponse,
          action: 'image_uploaded'
        }
      };
    } catch (error: any) {
      console.error('Failed to upload image via chat:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const chatErrorMessage = `Failed to upload image: ${errorMessage}`;
      const errorResponse = await sendMessage(chatErrorMessage);
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
    testConnection,
    isConnected,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
