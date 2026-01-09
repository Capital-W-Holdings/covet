'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Card, Button, Input, Select, Textarea } from '@/components/ui';
import { ImageUpload } from '@/components/ImageUpload';
import { useAuth } from '@/hooks';
import { ProductCategory, ProductCondition, ProductStatus } from '@/types';

const categoryOptions = [
  { value: ProductCategory.HANDBAGS, label: 'Handbags' },
  { value: ProductCategory.WATCHES, label: 'Watches' },
  { value: ProductCategory.JEWELRY, label: 'Jewelry' },
  { value: ProductCategory.ACCESSORIES, label: 'Accessories' },
  { value: ProductCategory.CLOTHING, label: 'Clothing' },
  { value: ProductCategory.SHOES, label: 'Shoes' },
];

const conditionOptions = [
  { value: ProductCondition.NEW_WITH_TAGS, label: 'New with Tags' },
  { value: ProductCondition.NEW_WITHOUT_TAGS, label: 'New without Tags' },
  { value: ProductCondition.EXCELLENT, label: 'Excellent' },
  { value: ProductCondition.VERY_GOOD, label: 'Very Good' },
  { value: ProductCondition.GOOD, label: 'Good' },
  { value: ProductCondition.FAIR, label: 'Fair' },
];

interface UploadedImage {
  url: string;
  publicId?: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: ProductCategory.HANDBAGS,
    subcategory: '',
    condition: ProductCondition.EXCELLENT,
    priceCents: 0,
    originalPriceCents: 0,
    metadata: {
      material: '',
      color: '',
      size: '',
      serialNumber: '',
      yearProduced: new Date().getFullYear(),
    },
    status: ProductStatus.DRAFT,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('metadata.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [field]: field === 'yearProduced' ? Number(value) : value,
        },
      }));
    } else if (name === 'priceCents' || name === 'originalPriceCents') {
      setFormData((prev) => ({
        ...prev,
        [name]: Math.round(Number(value) * 100),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (uploadedImages.length === 0) {
      setError('Please add at least one image');
      setSubmitting(false);
      return;
    }

    try {
      const images = uploadedImages.map((img, index) => ({
        url: img.url,
        alt: `${formData.brand} ${formData.title} - Image ${index + 1}`,
        order: index,
        isPrimary: index === 0,
      }));

      const payload = {
        ...formData,
        status: publish ? ProductStatus.ACTIVE : ProductStatus.DRAFT,
        images,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/products');
      } else {
        setError(data.error?.message || 'Failed to create product');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/products/new');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 max-w-3xl">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
          &larr; Back to Products
        </Link>

        <h1 className="text-2xl font-light text-gray-900 mb-8">Add New Product</h1>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          {/* Images */}
          <Card className="p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Product Images</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload high-quality images. The first image will be the main product photo.
            </p>

            <ImageUpload
              value={uploadedImages}
              onChange={setUploadedImages}
              maxImages={8}
              folder="products"
              disabled={submitting}
            />
          </Card>

          {/* Basic Info */}
          <Card className="p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Hermes Birkin 25 Togo Noir"
              />

              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                placeholder="e.g., Hermes"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  name="category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleInputChange}
                />
                <Input
                  label="Subcategory (optional)"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  placeholder="e.g., Totes"
                />
              </div>

              <Select
                label="Condition"
                name="condition"
                options={conditionOptions}
                value={formData.condition}
                onChange={handleInputChange}
              />

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Describe the item, its condition, and what's included..."
              />
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Pricing</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Price ($)"
                name="priceCents"
                type="number"
                step="0.01"
                min="0"
                value={(formData.priceCents / 100).toFixed(2)}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Original Retail Price ($)"
                name="originalPriceCents"
                type="number"
                step="0.01"
                min="0"
                value={(formData.originalPriceCents / 100).toFixed(2)}
                onChange={handleInputChange}
                helperText="Optional - shows discount"
              />
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Details (Optional)</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Material"
                name="metadata.material"
                value={formData.metadata.material}
                onChange={handleInputChange}
                placeholder="e.g., Togo Leather"
              />
              <Input
                label="Color"
                name="metadata.color"
                value={formData.metadata.color}
                onChange={handleInputChange}
                placeholder="e.g., Noir (Black)"
              />
              <Input
                label="Size"
                name="metadata.size"
                value={formData.metadata.size}
                onChange={handleInputChange}
                placeholder="e.g., 25cm"
              />
              <Input
                label="Year Produced"
                name="metadata.yearProduced"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.metadata.yearProduced}
                onChange={handleInputChange}
              />
              <Input
                label="Serial Number (partial)"
                name="metadata.serialNumber"
                value={formData.metadata.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g., T****25"
                className="sm:col-span-2"
              />
            </div>
          </Card>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              variant="outline"
              loading={submitting}
              disabled={submitting}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={submitting}
              disabled={submitting}
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1"
            >
              Publish Product
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
