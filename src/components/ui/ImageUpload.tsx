'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle, ImagePlus } from 'lucide-react';
import { useImageUpload, type UploadedImage } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 8,
  maxSizeMB = 10,
  folder,
  className,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    images: uploadedImages,
    uploading,
    error,
    progress,
    uploadFiles,
    removeImage: removeUploadedImage,
    clearError,
  } = useImageUpload({ maxFiles, maxSizeMB, folder });

  // Combine controlled value with uploaded images
  const allImages = [...value, ...uploadedImages];

  // Notify parent of changes
  const handleChange = useCallback((newImages: UploadedImage[]) => {
    if (onChange) {
      onChange(newImages);
    }
  }, [onChange]);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;
    
    clearError();
    const remainingSlots = maxFiles - allImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length > 0) {
      const results = await uploadFiles(filesToUpload);
      if (results.length > 0) {
        handleChange([...allImages, ...results]);
      }
    }
  }, [allImages, clearError, disabled, handleChange, maxFiles, uploadFiles]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // Remove image handler
  const handleRemove = useCallback((index: number) => {
    if (disabled) return;
    
    if (index < value.length) {
      // Remove from controlled value
      const newValue = value.filter((_, i) => i !== index);
      handleChange(newValue);
    } else {
      // Remove from uploaded images
      const uploadedIndex = index - value.length;
      removeUploadedImage(uploadedIndex);
      const newImages = uploadedImages.filter((_, i) => i !== uploadedIndex);
      handleChange([...value, ...newImages]);
    }
  }, [disabled, handleChange, removeUploadedImage, uploadedImages, value]);

  const canAddMore = allImages.length < maxFiles && !disabled;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Existing images */}
        {allImages.map((image, index) => (
          <div
            key={image.publicId || image.url}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
          >
            <Image
              src={image.url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            
            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Image number badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            disabled={uploading || disabled}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors',
              dragActive
                ? 'border-brand-gold bg-brand-cream/50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
              (uploading || disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="text-xs text-gray-500">{progress}%</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 text-center px-2">
                  {allImages.length === 0 ? 'Add photos' : 'Add more'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload instructions */}
      {allImages.length === 0 && !uploading && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive
              ? 'border-brand-gold bg-brand-cream/50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Up to {maxFiles} images, max {maxSizeMB}MB each • JPG, PNG, WebP
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Image count */}
      {allImages.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {allImages.length} of {maxFiles} images
          {allImages.length === 1 && ' • First image will be the main photo'}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
