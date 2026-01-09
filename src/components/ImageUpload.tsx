'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui';

interface UploadedImage {
  url: string;
  publicId?: string;
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 8,
  folder = 'products',
  className = '',
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const newImages: UploadedImage[] = [];
    const remainingSlots = maxImages - value.length;

    // Only upload up to remaining slots
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          newImages.push({
            url: data.data.url,
            publicId: data.data.publicId,
          });
        } else {
          setError(data.error?.message || `Failed to upload ${file.name}`);
        }
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages, folder]);

  const handleRemove = useCallback((index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  }, [value, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || value.length >= maxImages) return;
    
    handleUpload(e.dataTransfer.files);
  }, [disabled, value.length, maxImages, handleUpload]);

  const handleClick = useCallback(() => {
    if (disabled || value.length >= maxImages) return;
    inputRef.current?.click();
  }, [disabled, value.length, maxImages]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleUpload]);

  const canAddMore = value.length < maxImages && !disabled;

  return (
    <div className={className}>
      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {value.map((image, index) => (
          <div
            key={image.url}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
          >
            <Image
              src={image.url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {index === 0 && (
              <span className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                Main
              </span>
            )}
          </div>
        ))}

        {/* Upload Zone */}
        {canAddMore && (
          <div
            onClick={handleClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              aspect-square border-2 border-dashed rounded-lg
              flex flex-col items-center justify-center cursor-pointer
              transition-colors
              ${dragActive 
                ? 'border-brand-gold bg-brand-cream' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center px-2">
                  Drop image or click
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      <p className="text-sm text-gray-500">
        {value.length} of {maxImages} images • JPG, PNG, GIF, or WebP • Max 10MB each
      </p>

      {/* Add from URL button (optional) */}
      {canAddMore && value.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Tip: Drag and drop multiple images at once
          </p>
        </div>
      )}
    </div>
  );
}

// URL-based image input for existing products
interface ImageUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUrlInput({
  value,
  onChange,
  placeholder = 'https://example.com/image.jpg',
  disabled = false,
}: ImageUrlInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setError(null);
    setPreview(null);

    if (url && url.startsWith('http')) {
      // Try to load the image
      const img = document.createElement('img');
      img.onload = () => setPreview(url);
      img.onerror = () => setError('Invalid image URL');
      img.src = url;
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="url"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {preview && (
        <div className="relative w-20 h-20 rounded overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
    </div>
  );
}
