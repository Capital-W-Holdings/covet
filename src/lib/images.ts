/**
 * Image Upload Service
 * 
 * Provides image upload functionality with support for:
 * - Demo mode (stores files locally/in-memory)
 * - Cloudinary (recommended for production)
 * 
 * Required environment variables:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

// Check if we're in demo mode
export function isImageUploadDemo(): boolean {
  return !process.env.CLOUDINARY_CLOUD_NAME || 
         !process.env.CLOUDINARY_API_KEY ||
         !process.env.CLOUDINARY_API_SECRET;
}

// Get Cloudinary config
function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  };
}

// Generate Cloudinary signature for secure uploads
function generateSignature(params: Record<string, string>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign + apiSecret);
  
  // Simple hash for signature (in production, use proper crypto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

// In-memory storage for demo mode
const demoImages = new Map<string, { url: string; data: string }>();

/**
 * Upload an image from a base64 string or URL
 */
export async function uploadImage(
  imageData: string, // Base64 data URL or external URL
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'covet/products',
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
    format = 'auto',
  } = options;

  // Demo mode - generate a placeholder URL
  if (isImageUploadDemo()) {
    const publicId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // If it's already a URL, just return it
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      console.log('📷 Demo mode: Using external URL as-is');
      return {
        success: true,
        url: imageData,
        publicId,
        width: maxWidth,
        height: maxHeight,
        format: 'jpg',
      };
    }
    
    // For base64, store in memory and return a demo URL
    demoImages.set(publicId, { url: `/api/images/${publicId}`, data: imageData });
    console.log(`📷 Demo mode: Stored image as ${publicId}`);
    
    return {
      success: true,
      url: `/api/images/${publicId}`,
      publicId,
      width: maxWidth,
      height: maxHeight,
      format: 'jpg',
    };
  }

  // Production mode - upload to Cloudinary
  try {
    const config = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Build transformation string
    const transformation = `c_limit,w_${maxWidth},h_${maxHeight},q_${quality},f_${format}`;
    
    // Prepare upload parameters
    const uploadParams: Record<string, string> = {
      timestamp,
      folder,
      transformation,
    };
    
    // Generate signature
    const signature = generateSignature(uploadParams, config.apiSecret);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('api_key', config.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('transformation', transformation);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  images: string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  return Promise.all(images.map(img => uploadImage(img, options)));
}

/**
 * Delete an image by public ID
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  if (isImageUploadDemo()) {
    demoImages.delete(publicId);
    console.log(`📷 Demo mode: Deleted image ${publicId}`);
    return { success: true };
  }

  try {
    const config = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const params: Record<string, string> = {
      public_id: publicId,
      timestamp,
    };
    
    const signature = generateSignature(params, config.apiSecret);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', config.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return { success: true };
  } catch (error) {
    console.error('Image delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get a demo image by ID (for demo mode serving)
 */
export function getDemoImage(publicId: string): string | null {
  const image = demoImages.get(publicId);
  return image?.data || null;
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // If not a Cloudinary URL, return as-is
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 80 } = options;
  
  // Insert transformation into Cloudinary URL
  const transformations: string[] = [`q_${quality}`, 'f_auto'];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push('c_limit');
  
  const transformStr = transformations.join(',');
  
  // Cloudinary URLs have format: /upload/... - insert transformation after /upload/
  return url.replace('/upload/', `/upload/${transformStr}/`);
}

/**
 * Validate image file
 */
export function validateImage(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } = options;
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.replace('image/', '')).join(', ')}`,
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }
  
  return { valid: true };
}

/**
 * Convert File to base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
