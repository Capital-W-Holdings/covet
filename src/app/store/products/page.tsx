'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { Container, Card, Button, Badge, Spinner, EmptyState, Input, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { ProductStatus } from '@/types';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: ProductStatus.DRAFT, label: 'Draft' },
  { value: ProductStatus.ACTIVE, label: 'Active' },
  { value: ProductStatus.SOLD, label: 'Sold' },
  { value: ProductStatus.ARCHIVED, label: 'Archived' },
];

const statusColors: Record<ProductStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [ProductStatus.DRAFT]: 'warning',
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.SOLD]: 'default',
  [ProductStatus.RESERVED]: 'warning',
  [ProductStatus.ARCHIVED]: 'danger',
};

export default function StoreProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('pageSize', '20');

      const res = await fetch(`/api/store/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.items);
        setTotal(data.data.total);
        setHasMore(data.data.hasMore);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, search, status, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/store/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // Ignore
    }
  };

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === ProductStatus.ACTIVE 
      ? ProductStatus.DRAFT 
      : ProductStatus.ACTIVE;

    try {
      const res = await fetch(`/api/store/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: newStatus } : p
          )
        );
      }
    } catch {
      // Ignore
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'STORE_ADMIN' && user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/store/products');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/store" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Products</h1>
            <p className="text-gray-500">{total} products</p>
          </div>
          <Link href="/store/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="sm:w-48"
            />
          </div>
        </Card>

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16" />}
            title="No products yet"
            description="Add your first product to get started selling."
            action={
              <Link href="/store/products/new">
                <Button>Add Product</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                        <Badge variant={statusColors[product.status]}>{product.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {product.brand} • SKU: {product.sku}
                      </p>
                      <p className="text-sm text-gray-400">{product.viewCount} views</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(product.priceCents)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusToggle(product)}
                        title={product.status === ProductStatus.ACTIVE ? 'Unpublish' : 'Publish'}
                      >
                        {product.status === ProductStatus.ACTIVE ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Link href={`/store/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
