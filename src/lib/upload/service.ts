/**
 * Image Upload Service
 * 
 * Provides image upload functionality with support for:
 * - Demo mode (stores files locally in /public/uploads)
 * - AWS S3
 * - Cloudinary
 * - Vercel Blob
 * 
 * Required environment variables:
 * - IMAGE_PROVIDER: 's3' | 'cloudinary' | 'vercel-blob' (optional, defaults to demo)
 * 
 * For S3:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - AWS_S3_BUCKET
 * 
 * For Cloudinary:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 * 
 * For Vercel Blob:
 * - BLOB_READ_WRITE_TOKEN
 */

import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Types
export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface UploadOptions {
  folder?: string;
  maxSizeBytes?: number;
  allowedFormats?: string[];
  generateThumbnail?: boolean;
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  folder: 'products',
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  generateThumbnail: true,
};

// Check if we're in demo mode
export function isImageDemo(): boolean {
  return !process.env.IMAGE_PROVIDER;
}

// Get the configured provider
function getProvider(): string {
  return process.env.IMAGE_PROVIDER?.toLowerCase() || 'demo';
}

// Validate file
function validateFile(
  buffer: Buffer,
  filename: string,
  options: Required<UploadOptions>
): { valid: boolean; error?: string } {
  // Check size
  if (buffer.length > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${options.maxSizeBytes / 1024 / 1024}MB`,
    };
  }

  // Check format
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  if (!options.allowedFormats.includes(ext)) {
    return {
      valid: false,
      error: `Invalid format. Allowed: ${options.allowedFormats.join(', ')}`,
    };
  }

  return { valid: true };
}

// Generate unique filename
function generateFilename(originalName: string, folder: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const id = uuid().split('-')[0];
  const timestamp = Date.now();
  return `${folder}/${timestamp}-${id}${ext}`;
}

/**
 * Upload an image
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate file
  const validation = validateFile(buffer, filename, opts);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const provider = getProvider();

  try {
    switch (provider) {
      case 's3':
        return await uploadToS3(buffer, filename, opts);
      case 'cloudinary':
        return await uploadToCloudinary(buffer, filename, opts);
      case 'vercel-blob':
        return await uploadToVercelBlob(buffer, filename, opts);
      default:
        return await uploadToLocal(buffer, filename, opts);
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  const provider = getProvider();

  try {
    switch (provider) {
      case 's3':
        return await deleteFromS3(publicId);
      case 'cloudinary':
        return await deleteFromCloudinary(publicId);
      case 'vercel-blob':
        return await deleteFromVercelBlob(publicId);
      default:
        return await deleteFromLocal(publicId);
    }
  } catch (error) {
    console.error('Image delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

// ============================================================================
// DEMO MODE (Local Storage)
// ============================================================================

async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  options: Required<UploadOptions>
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', options.folder);
  
  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  const newFilename = generateFilename(filename, '');
  const filepath = path.join(uploadDir, path.basename(newFilename));
  
  await fs.writeFile(filepath, buffer);

  const url = `/uploads/${options.folder}/${path.basename(newFilename)}`;
  
  console.log(`📷 Demo upload: ${url}`);
  
  return {
    success: true,
    url,
    publicId: `local:${options.folder}/${path.basename(newFilename)}`,
  };
}

async function deleteFromLocal(publicId: string): Promise<{ success: boolean; error?: string }> {
  if (!publicId.startsWith('local:')) {
    return { success: false, error: 'Invalid local public ID' };
  }

  const relativePath = publicId.replace('local:', '');
  const filepath = path.join(process.cwd(), 'public', 'uploads', relativePath);

  try {
    await fs.unlink(filepath);
    return { success: true };
  } catch (error) {
    // File might not exist, that's okay
    return { success: true };
  }
}

// ============================================================================
// AWS S3
// ============================================================================

async function uploadToS3(
  buffer: Buffer,
  filename: string,
  options: Required<UploadOptions>
): Promise<UploadResult> {
  // Use require to bypass TypeScript's module resolution
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  let s3Module: any;
  
  try {
    // Dynamic require for optional dependency
    s3Module = require('@aws-sdk/client-s3');
  } catch {
    throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
  }

  const { S3Client, PutObjectCommand } = s3Module;
  
  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const bucket = process.env.AWS_S3_BUCKET!;
  const key = generateFilename(filename, options.folder);
  const contentType = getContentType(filename);

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // 1 year
  }));

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    success: true,
    url,
    publicId: `s3:${key}`,
  };
}

async function deleteFromS3(publicId: string): Promise<{ success: boolean; error?: string }> {
  if (!publicId.startsWith('s3:')) {
    return { success: false, error: 'Invalid S3 public ID' };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  let s3Module: any;
  
  try {
    s3Module = require('@aws-sdk/client-s3');
  } catch {
    throw new Error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
  }

  const { S3Client, DeleteObjectCommand } = s3Module;

  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = publicId.replace('s3:', '');
  const bucket = process.env.AWS_S3_BUCKET!;

  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }));

  return { success: true };
}

// ============================================================================
// CLOUDINARY
// ============================================================================

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  options: Required<UploadOptions>
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // Create form data
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder;
  
  // Generate signature
  const crypto = await import('crypto');
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  // Create form data - convert Buffer properly
  const formData = new FormData();
  // Create a new ArrayBuffer copy to avoid SharedArrayBuffer issues
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  formData.append('file', new Blob([arrayBuffer]), filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary error: ${error}`);
  }

  const data = await response.json();

  return {
    success: true,
    url: data.secure_url,
    publicId: `cloudinary:${data.public_id}`,
  };
}

async function deleteFromCloudinary(publicId: string): Promise<{ success: boolean; error?: string }> {
  if (!publicId.startsWith('cloudinary:')) {
    return { success: false, error: 'Invalid Cloudinary public ID' };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const id = publicId.replace('cloudinary:', '');
  const timestamp = Math.floor(Date.now() / 1000);
  
  const crypto = await import('crypto');
  const signatureString = `public_id=${id}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const formData = new FormData();
  formData.append('public_id', id);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary delete error: ${error}`);
  }

  return { success: true };
}

// ============================================================================
// VERCEL BLOB
// ============================================================================

async function uploadToVercelBlob(
  buffer: Buffer,
  filename: string,
  options: Required<UploadOptions>
): Promise<UploadResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  let blobModule: any;
  
  try {
    blobModule = require('@vercel/blob');
  } catch {
    throw new Error('Vercel Blob not installed. Run: npm install @vercel/blob');
  }

  const { put } = blobModule;
  const pathname = generateFilename(filename, options.folder);

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: getContentType(filename),
  });

  return {
    success: true,
    url: blob.url,
    publicId: `vercel:${blob.url}`,
  };
}

async function deleteFromVercelBlob(publicId: string): Promise<{ success: boolean; error?: string }> {
  if (!publicId.startsWith('vercel:')) {
    return { success: false, error: 'Invalid Vercel Blob public ID' };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  let blobModule: any;
  
  try {
    blobModule = require('@vercel/blob');
  } catch {
    throw new Error('Vercel Blob not installed. Run: npm install @vercel/blob');
  }

  const { del } = blobModule;
  const url = publicId.replace('vercel:', '');

  await del(url);

  return { success: true };
}

// ============================================================================
// UTILITIES
// ============================================================================

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // For Cloudinary URLs, add transformations
  if (url.includes('cloudinary.com')) {
    const { width, height, quality = 80 } = options;
    const transforms = [];
    
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push('f_auto'); // Auto format

    // Insert transformations into URL
    return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
  }

  // For other URLs, return as-is (could add imgix, etc.)
  return url;
}
