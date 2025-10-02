'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NotificationMessage } from '@/types/chat';
import toast from 'react-hot-toast';

export function useNotifications() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connectToNotifications = useCallback(() => {
    // Clear any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const streamUrl = api.notifications.getStreamUrl();
      console.log(`[SSE] Attempting connection ${connectionAttempts + 1}/${maxReconnectAttempts} to:`, streamUrl);
      
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      // Connection opened successfully
      eventSource.onopen = () => {
        console.log('[SSE] Connection opened successfully');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Send a test message to verify connection
        setTimeout(() => {
          if (eventSource.readyState === EventSource.OPEN) {
            console.log('[SSE] Connection verified - readyState is OPEN');
          }
        }, 100);
      };

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        console.log('[SSE] Message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Parsed data:', data);
          
          // Handle connection confirmation message
          if (data.type === 'connection') {
            console.log('[SSE] Connection confirmed:', data.message);
            setIsConnected(true);
            setConnectionAttempts(0);
            return;
          }
          
          // Handle image notifications
          handleNotification(data);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      // Handle connection errors
      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        setIsConnected(false);
        
        // Close current connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Attempt reconnection with exponential backoff
        const newAttempts = connectionAttempts + 1;
        setConnectionAttempts(newAttempts);
        
        if (newAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, newAttempts), 10000); // Max 10 seconds
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToNotifications();
          }, delay);
          
          if (newAttempts === 1) {
            toast.error('Connection lost. Reconnecting...');
          }
        } else {
          console.error('[SSE] Max reconnection attempts reached');
          toast.error('Failed to connect to notifications. Please refresh the page.');
        }
      };

      return eventSource;
    } catch (error) {
      console.error('[SSE] Failed to create connection:', error);
      setIsConnected(false);
      
      // Attempt reconnection after error
      const newAttempts = connectionAttempts + 1;
      setConnectionAttempts(newAttempts);
      
      if (newAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, newAttempts), 10000);
        console.log(`[SSE] Retrying connection in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToNotifications();
        }, delay);
      } else {
        console.error('[SSE] Max connection attempts reached');
        toast.error('Failed to connect to notifications. Please refresh the page.');
      }
    }
  }, [connectionAttempts, maxReconnectAttempts]);

    const handleNotification = (notification: any) => {
      // Handle backend ImageNotification format
      if (notification.imageId && notification.status) {
        const statusEmoji = getStatusEmoji(notification.status);
        const title = notification.title || 'Image';
        
        let message: string;
        let toastType: 'success' | 'error' | 'default' = 'default';
        
        switch (notification.status) {
          case 'READY':
            message = `${statusEmoji} ${title} is ready!`;
            toastType = 'success';
            break;
          case 'FAILED':
            message = `${statusEmoji} ${title} processing failed`;
            toastType = 'error';
            break;
          case 'UPLOADED':
            message = `${statusEmoji} ${title} uploaded successfully`;
            toastType = 'success';
            break;
          case 'DELETED':
            message = `${statusEmoji} ${title} deleted`;
            toastType = 'default';
            break;
          default:
            message = `${statusEmoji} ${title}: ${notification.status}`;
            toastType = 'default';
        }
        
        if (toastType === 'success') {
          toast.success(message);
        } else if (toastType === 'error') {
          toast.error(message);
        } else {
          toast(message);
        }

        // Invalidate and refetch images
        queryClient.invalidateQueries({ queryKey: ['images'] });
        
        // Update specific image if we have the ID
        if (notification.imageId) {
          queryClient.invalidateQueries({ 
            queryKey: ['images', notification.imageId] 
          });
        }
      }
    };

    const getStatusEmoji = (status: string | undefined): string => {
      if (!status) return '❓';
      
      switch (status.toLowerCase()) {
        case 'ready':
          return '✅';
        case 'failed':
          return '❌';
        case 'processing':
          return '⚙️';
        case 'pending':
          return '⏳';
        case 'uploaded':
          return '📤';
        case 'deleted':
          return '🗑️';
        default:
          return '📷';
      }
    };

  useEffect(() => {
    // Start connection
    connectToNotifications();

    // Set up periodic connection status check
    const statusCheckInterval = setInterval(() => {
      if (eventSourceRef.current) {
        const readyState = eventSourceRef.current.readyState;
        console.log('[SSE] Status check - readyState:', readyState);
        
        if (readyState === EventSource.OPEN) {
          setIsConnected(true);
        } else if (readyState === EventSource.CLOSED) {
          setIsConnected(false);
          // If connection is closed and we haven't reached max attempts, try to reconnect
          if (connectionAttempts < maxReconnectAttempts) {
            console.log('[SSE] Connection closed, attempting reconnection');
            connectToNotifications();
          }
        }
      } else {
        setIsConnected(false);
      }
    }, 3000);

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Cleaning up connection');
      clearInterval(statusCheckInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [connectToNotifications, connectionAttempts, maxReconnectAttempts]);

  const testConnection = useCallback(() => {
    console.log('[SSE] Manual connection test triggered');
    if (eventSourceRef.current) {
      console.log('[SSE] Current connection state:', {
        readyState: eventSourceRef.current.readyState,
        url: eventSourceRef.current.url,
        OPEN: EventSource.OPEN,
        CONNECTING: EventSource.CONNECTING,
        CLOSED: EventSource.CLOSED
      });
    }
    connectToNotifications();
  }, [connectToNotifications]);

  return {
    isConnected,
    connectionAttempts,
    testConnection,
  };
}
