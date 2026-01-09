# Covet Image Upload

## Overview

Covet supports image uploads for product photos with multiple storage providers:
- **Demo Mode** - Local storage in `/public/uploads` (development only)
- **AWS S3** - Scalable object storage
- **Cloudinary** - Image CDN with transformations
- **Vercel Blob** - Simple serverless storage

## Quick Start

### Development (Demo Mode)

No configuration needed! Images are stored locally.

```bash
npm run dev
# Images saved to /public/uploads/products/
```

Demo mode:
- Files saved to `public/uploads/`
- URLs like `/uploads/products/123456-abc.jpg`
- Data persists until manually deleted
- Not suitable for production

### Production Setup

Choose a provider and configure environment variables.

## Providers

### AWS S3 (Recommended for Production)

```bash
# Install dependency
npm install @aws-sdk/client-s3

# .env.local
IMAGE_PROVIDER="s3"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="covet-images"
```

**S3 Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::covet-images/*"
    }
  ]
}
```

**CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

### Cloudinary

```bash
# No npm install needed - uses REST API

# .env.local
IMAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="..."
```

**Features:**
- Automatic format optimization (WebP, AVIF)
- On-the-fly image resizing
- CDN delivery worldwide

### Vercel Blob

```bash
# Install dependency
npm install @vercel/blob

# .env.local
IMAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

Get token from: Vercel Dashboard → Storage → Blob

## Usage

### Upload Component

```tsx
import { ImageUpload } from '@/components/ImageUpload';

function ProductForm() {
  const [images, setImages] = useState([]);

  return (
    <ImageUpload
      value={images}
      onChange={setImages}
      maxImages={8}
      folder="products"
    />
  );
}
```

### Direct API Usage

```typescript
// Upload
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'products');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { data } = await response.json();
// { url: "https://...", publicId: "s3:products/..." }
```

## API Reference

### POST /api/upload

Upload an image file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (required), `folder` (optional, default: "products")

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/products/123.jpg",
    "publicId": "s3:products/123.jpg",
    "isDemo": false
  }
}
```

**Errors:**
- `401` - Unauthorized (login required)
- `400` - Invalid file type or size
- `429` - Rate limited (20/min)

### GET /api/upload

Get upload configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "maxFileSize": 10485760,
    "allowedTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "isDemo": true,
    "provider": "demo"
  }
}
```

## Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 10MB |
| Max images per product | 8 |
| Rate limit | 20 uploads/minute |
| Allowed formats | JPG, PNG, GIF, WebP |

## Security

- **Authentication Required** - Only store admins can upload
- **Rate Limiting** - 20 uploads per minute per user
- **File Validation** - Type and size checked server-side
- **Secure URLs** - Public but unguessable paths

## Image Optimization

### Cloudinary Auto-Optimization

```typescript
import { getOptimizedUrl } from '@/lib/upload';

// Original URL
const url = 'https://res.cloudinary.com/.../image.jpg';

// Optimized (640px wide, 80% quality, auto format)
const optimized = getOptimizedUrl(url, { width: 640, quality: 80 });
// → https://res.cloudinary.com/.../w_640,q_80,f_auto/image.jpg
```

### Next.js Image Component

```tsx
import Image from 'next/image';

<Image
  src={product.images[0].url}
  alt={product.title}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

## Troubleshooting

### "Upload failed" Error

1. Check file size (max 10MB)
2. Check file type (JPG, PNG, GIF, WebP only)
3. Check authentication (must be logged in as store admin)

### Images Not Displaying

1. Check Next.js config has the domain pattern
2. Check CORS settings on S3/Cloudinary
3. Verify URL is accessible directly in browser

### Rate Limit Exceeded

Wait 1 minute before retrying. Consider batching uploads.

### S3 Permission Denied

1. Verify IAM credentials have `s3:PutObject` permission
2. Check bucket policy allows public reads
3. Verify bucket name matches `AWS_S3_BUCKET`

## Architecture

```
Client (ImageUpload Component)
         │
         ▼
┌─────────────────────┐
│  POST /api/upload   │
│  - Auth check       │
│  - Rate limit       │
│  - Validate file    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Upload Service     │
│  - Route to provider│
└─────────┬───────────┘
          │
    ┌─────┼─────┬─────┐
    ▼     ▼     ▼     ▼
  Demo   S3   Cloud  Blob
         inary
```

## Files

| File | Purpose |
|------|---------|
| `src/lib/upload/service.ts` | Upload service with providers |
| `src/lib/upload/index.ts` | Barrel exports |
| `src/app/api/upload/route.ts` | Upload API endpoint |
| `src/components/ImageUpload.tsx` | React upload component |
| `public/uploads/` | Demo mode storage |
