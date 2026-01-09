'use client';

import { useState, useCallback } from 'react';

export interface UploadedImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UseImageUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  folder?: string;
}

export interface UseImageUploadReturn {
  images: UploadedImage[];
  uploading: boolean;
  error: string | null;
  progress: number;
  uploadFile: (file: File) => Promise<UploadedImage | null>;
  uploadFiles: (files: FileList | File[]) => Promise<UploadedImage[]>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  clearError: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxFiles = 10,
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    folder,
  } = options;

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed: ${allowedTypes.map(t => t.replace('image/', '')).join(', ')}`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${maxSizeMB}MB`;
    }

    return null;
  }, [allowedTypes, maxSizeMB]);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    // Check max files limit
    if (images.length >= maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Convert to base64
      setProgress(20);
      const base64 = await fileToBase64(file);
      
      setProgress(40);

      // Upload to server
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, folder }),
      });

      setProgress(80);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      const uploadedImage: UploadedImage = {
        url: data.data.url,
        publicId: data.data.publicId,
        width: data.data.width,
        height: data.data.height,
        format: data.data.format,
      };

      setImages(prev => [...prev, uploadedImage]);
      setProgress(100);

      return uploadedImage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [fileToBase64, folder, images.length, maxFiles, validateFile]);

  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<UploadedImage[]> => {
    const fileArray = Array.from(files);
    const results: UploadedImage[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const result = await uploadFile(fileArray[i]);
      if (result) {
        results.push(result);
      }
      setProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    return results;
  }, [uploadFile]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    images,
    uploading,
    error,
    progress,
    uploadFile,
    uploadFiles,
    removeImage,
    clearImages,
    clearError,
  };
}
