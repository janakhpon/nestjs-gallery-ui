export interface Image {
  id: string;
  title: string;
  description: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  s3Key: string;
  s3Url: string;
  status: ImageStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ImageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface ImagesResponse {
  images: Image[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateImageDto {
  title: string;
  description: string;
  file: File;
}

export interface UpdateImageDto {
  title?: string;
  description?: string;
}

export interface ImageUploadResponse {
  id: string;
  message: string;
  status: ImageStatus;
}
