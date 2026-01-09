'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Shield, Check, Truck, RotateCcw } from 'lucide-react';
import { Container, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { ShareButton } from '@/components/ui/ShareButton';
import { PriceAlertButton } from '@/components/ui/PriceAlert';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useProductBySku, useRelatedProducts, useCart, useAuth, WishlistButton } from '@/hooks';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { AuthenticationStatus, ProductCondition, ProductStatus, ProductCategory } from '@/types';
import { findProductBySku, type StaticProduct } from '@/lib/staticProducts';

const conditionDescriptions: Record<ProductCondition, string> = {
  [ProductCondition.NEW_WITH_TAGS]: 'Brand new, never used, with original tags attached',
  [ProductCondition.NEW_WITHOUT_TAGS]: 'Brand new, never used, tags removed',
  [ProductCondition.EXCELLENT]: 'Minimal signs of use, exceptional condition',
  [ProductCondition.VERY_GOOD]: 'Light wear, well maintained',
  [ProductCondition.GOOD]: 'Normal wear consistent with regular use',
  [ProductCondition.FAIR]: 'Visible wear, still functional and presentable',
};

// Helper to convert static product to display format
function convertStaticProduct(staticProduct: StaticProduct) {
  return {
    id: staticProduct.id,
    sku: staticProduct.sku,
    title: staticProduct.title,
    brand: staticProduct.brand,
    category: staticProduct.category as ProductCategory,
    condition: staticProduct.condition as ProductCondition,
    priceCents: staticProduct.priceCents,
    originalPriceCents: staticProduct.originalPriceCents,
    description: staticProduct.description,
    images: [{ url: staticProduct.image, alt: staticProduct.title, order: 0, isPrimary: true }],
    authenticationStatus: AuthenticationStatus.COVET_CERTIFIED,
    status: ProductStatus.ACTIVE,
    metadata: {},
    store: staticProduct.store,
    // Add required fields for Product type compatibility
    storeId: 'store_covet',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  // First check static products (for shop page products)
  const staticProduct = findProductBySku(sku);

  // Only call API if no static product found
  const { product: apiProduct, loading, error } = useProductBySku(staticProduct ? '' : sku);

  // Use static product if found, otherwise use API product
  const product = staticProduct ? convertStaticProduct(staticProduct) : apiProduct;

  const { products: relatedProducts, loading: relatedLoading } = useRelatedProducts(product?.id || '', 4);
  const { addToCart, item: cartItem } = useCart();
  const { user } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Scroll to top on mount - fixes auto-scroll to bottom issue
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sku]);

  // Show loading only if we don't have a static product and API is loading
  if (!staticProduct && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Product not found"
          description="The product you're looking for doesn't exist or has been removed."
          action={
            <Link href="/shop">
              <Button>Back to Shop</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const isInCart = cartItem?.id === product.id;
  const isAvailable = product.status === ProductStatus.ACTIVE;
  const discount = product.originalPriceCents
    ? calculateDiscount(product.originalPriceCents, product.priceCents)
    : 0;

  const handleAddToCart = async () => {
    if (!isAvailable || isInCart) return;

    // Redirect to register page if not logged in
    if (!user) {
      router.push('/register?redirect=' + encodeURIComponent(`/products/${sku}`));
      return;
    }

    setIsAddingToCart(true);
    addToCart(product);
    setIsAddingToCart(false);

    // Optional: redirect to cart
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <Container className="py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-brand-charcoal"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.authenticationStatus === AuthenticationStatus.COVET_CERTIFIED && (
                  <Badge variant="gold" className="text-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    Covet Certified
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge variant="danger">{discount}% Off</Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <WishlistButton product={product} />
                <PriceAlertButton product={product} />
                <ShareButton 
                  url={typeof window !== 'undefined' ? window.location.href : `https://covet.com/products/${product.sku}`}
                  title={`${product.brand} - ${product.title}`}
                  description={product.description}
                  image={product.images[0]?.url}
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImageIndex === index
                        ? 'border-brand-charcoal'
                        : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            <p className="text-sm font-medium text-brand-gold uppercase tracking-wider mb-2">
              {product.brand}
            </p>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-gray-900">
                {formatPrice(product.priceCents)}
              </span>
              {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPriceCents)}
                </span>
              )}
            </div>

            {/* Condition */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Condition</span>
                <Badge>{product.condition.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {conditionDescriptions[product.condition]}
              </p>
            </div>

            {/* Add to Cart */}
            <div className="mb-8">
              {isAvailable ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleAddToCart}
                  loading={isAddingToCart}
                  disabled={isInCart}
                  className="w-full"
                >
                  {isInCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      In Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              ) : (
                <Button size="lg" variant="outline" disabled className="w-full">
                  {product.status === ProductStatus.SOLD ? 'Sold' : 'Unavailable'}
                </Button>
              )}

              {!user && isAvailable && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  <Link href="/login" className="text-brand-gold hover:underline">
                    Sign in
                  </Link>
                  {' '}to complete your purchase
                </p>
              )}
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Authenticated</p>
                  <p className="text-xs text-gray-500">Verified genuine</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-500">Insured delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Returns</p>
                  <p className="text-xs text-gray-500">14-day policy</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Details */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (() => {
              const meta = product.metadata as {
                material?: string;
                color?: string;
                size?: string;
                yearProduced?: number;
                measurements?: { width: number; height: number; depth?: number; unit: string };
                includedAccessories?: string[];
              };
              return (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Details</h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {meta.material && (
                      <>
                        <dt className="text-sm text-gray-500">Material</dt>
                        <dd className="text-sm text-gray-900">{meta.material}</dd>
                      </>
                    )}
                    {meta.color && (
                      <>
                        <dt className="text-sm text-gray-500">Color</dt>
                        <dd className="text-sm text-gray-900">{meta.color}</dd>
                      </>
                    )}
                    {meta.size && (
                      <>
                        <dt className="text-sm text-gray-500">Size</dt>
                        <dd className="text-sm text-gray-900">{meta.size}</dd>
                      </>
                    )}
                    {meta.yearProduced && (
                      <>
                        <dt className="text-sm text-gray-500">Year</dt>
                        <dd className="text-sm text-gray-900">{meta.yearProduced}</dd>
                      </>
                    )}
                    {meta.measurements && (
                      <>
                        <dt className="text-sm text-gray-500">Dimensions</dt>
                        <dd className="text-sm text-gray-900">
                          {meta.measurements.width} x {meta.measurements.height}
                          {meta.measurements.depth && ` x ${meta.measurements.depth}`}
                          {' '}{meta.measurements.unit}
                        </dd>
                      </>
                    )}
                    {meta.includedAccessories && meta.includedAccessories.length > 0 && (
                      <>
                        <dt className="text-sm text-gray-500">Includes</dt>
                        <dd className="text-sm text-gray-900">
                          {meta.includedAccessories.join(', ')}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              );
            })()}

            {/* SKU */}
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="text-2xl font-light text-gray-900 mb-8">You May Also Like</h2>
            <ProductGrid products={relatedProducts} loading={relatedLoading} columns={4} />
          </div>
        )}
      </Container>
    </div>
  );
}
