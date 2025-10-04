'use client';

import React, { useState, useEffect } from 'react';
import { typedApi, type Image, type CreateImageDto, type GetImagesParams } from '@/lib/api-typed';

/**
 * Example component demonstrating fully typed API usage
 * This shows how the generated OpenAPI types provide complete type safety
 */
export default function TypedApiExample() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Fetch images with full type safety
  const fetchImages = async (params: GetImagesParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // This is fully typed - TypeScript knows the exact shape of the response
      const response = await typedApi.images.getAll({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
      });

      // TypeScript knows these properties exist and their types
      setImages(response.images);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  // Get single image with full type safety
  const fetchImage = async (id: string) => {
    try {
      // TypeScript knows this returns a single Image object
      const image = await typedApi.images.getById(id);
      console.log('Fetched image:', image);
      return image;
    } catch (err) {
      console.error('Failed to fetch image:', err);
      throw err;
    }
  };

  // Upload image with full type safety
  const uploadImage = async (file: File, metadata?: { title?: string; description?: string }) => {
    setLoading(true);
    setError(null);

    try {
      // TypeScript knows the exact shape of CreateImageDto
      const createData: CreateImageDto & { file: File } = {
        file,
        title: metadata?.title,
        description: metadata?.description,
      };

      // TypeScript knows this returns a CreateImageResponse
      const response = await typedApi.images.upload(createData);
      
      console.log('Upload response:', response);
      
      // Refresh the images list
      await fetchImages();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update image with full type safety
  const updateImage = async (id: string, updates: { title?: string; description?: string }) => {
    try {
      // TypeScript knows the exact shape of UpdateImageDto
      const response = await typedApi.images.update(id, updates);
      
      // Update the local state
      setImages(prev => prev.map(img => img.id === id ? response : img));
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
      throw err;
    }
  };

  // Delete image with full type safety
  const deleteImage = async (id: string) => {
    try {
      // TypeScript knows this returns a DeleteImageResponse
      await typedApi.images.delete(id);
      
      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    }
  };

  // Get download URL with full type safety
  const getDownloadUrl = async (id: string) => {
    try {
      // TypeScript knows this returns { downloadUrl: string }
      const response = await typedApi.images.getDownloadUrl(id);
      return response.downloadUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get download URL');
      throw err;
    }
  };

  // Health check with full type safety
  const checkHealth = async () => {
    try {
      // TypeScript knows this returns { status: string; timestamp: string; uptime: number; memory: object }
      const health = await typedApi.health();
      console.log('API Health:', health);
      return health;
    } catch (err) {
      console.error('Health check failed:', err);
      throw err;
    }
  };

  // Load images on component mount
  useEffect(() => {
    fetchImages();
    checkHealth();
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, {
        title: `Uploaded ${file.name}`,
        description: `File uploaded at ${new Date().toLocaleString()}`,
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Typed API Example</h1>
      
      {/* Health Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">API Health</h2>
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Health
        </button>
      </div>

      {/* Upload Section */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Upload Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="mb-2"
        />
        {loading && <p className="text-blue-600">Uploading...</p>}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Images Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Images ({pagination.total})</h2>
        
        {loading && <p className="text-blue-600">Loading images...</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{image.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-600 mb-2">{image.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Status: <span className={`font-semibold ${
                  image.status === 'READY' ? 'text-green-600' :
                  image.status === 'PROCESSING' ? 'text-yellow-600' :
                  image.status === 'FAILED' ? 'text-red-600' :
                  'text-gray-600'
                }`}>{image.status}</span></p>
                <p>Size: {(image.size / 1024).toFixed(1)} KB</p>
                <p>Type: {image.mimeType}</p>
                {image.width && image.height && (
                  <p>Dimensions: {image.width} × {image.height}</p>
                )}
                <p>Created: {new Date(image.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => fetchImage(image.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  View Details
                </button>
                <button
                  onClick={() => getDownloadUrl(image.id)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Get Download URL
                </button>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => fetchImages({ page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchImages({ page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Type Safety Demo */}
      <div className="mt-8 p-4 bg-green-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Type Safety Benefits</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ All API responses are fully typed</li>
          <li>✅ Request parameters are validated at compile time</li>
          <li>✅ Auto-completion for all API methods</li>
          <li>✅ Compile-time error checking</li>
          <li>✅ Refactoring safety - changes to API automatically update types</li>
        </ul>
      </div>
    </div>
  );
}
