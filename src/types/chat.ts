export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    imageId?: string;
    action?: string;
    [key: string]: any;
  };
}

export interface ChatResponse {
  content: string;
  metadata?: {
    imageId?: string;
    action?: string;
    [key: string]: any;
  };
}

export interface MCPRequest {
  message: string;
  context?: {
    currentImages?: string[];
    userId?: string;
  };
}

export interface NotificationMessage {
  type: 'image_ready' | 'image_failed' | 'upload_started' | 'processing_complete';
  imageId: string;
  title: string;
  status: string;
  timestamp: string;
  message: string;
}
