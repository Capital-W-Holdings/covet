'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { Container, Button, Card, EmptyState, Badge, Skeleton } from '@/components/ui';
import { ShareButton } from '@/components/ui/ShareButton';
import { useWishlist, useCart } from '@/hooks';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { AuthenticationStatus, ProductStatus } from '@/types';

export default function WishlistPage() {
  const { products, loading, error, removeFromWishlist, refreshWishlist, itemCount } = useWishlist();
  const { addToCart, item: cartItem } = useCart();

  // Refresh product data on mount
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8 lg:py-12">
          <Skeleton className="h-8 w-40 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon on any product"
            action={
              <Link href="/shop">
                <Button>
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            }
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} saved</p>
          </div>
          <Link href="/shop">
            <Button variant="outline">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
            const discount = product.originalPriceCents
              ? calculateDiscount(product.originalPriceCents, product.priceCents)
              : 0;
            const isInCart = cartItem?.id === product.id;
            const isAvailable = product.status === ProductStatus.ACTIVE;

            return (
              <Card key={product.id} hover className="group relative">
                <Link href={`/products/${product.sku}`} className="block">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    {/* Status overlay for sold items */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-4 py-2 bg-white/90 rounded-lg font-medium text-gray-900">
                          {product.status === ProductStatus.SOLD ? 'Sold' : 'Unavailable'}
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.authenticationStatus === AuthenticationStatus.COVET_CERTIFIED && (
                        <Badge variant="gold">Covet Certified</Badge>
                      )}
                      {discount > 0 && isAvailable && (
                        <Badge variant="danger">{discount}% Off</Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Brand */}
                    <p className="text-xs font-medium text-brand-gold uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>

                    {/* Title */}
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-gold transition-colors">
                      {product.title}
                    </h3>

                    {/* Condition */}
                    <p className="text-xs text-gray-500 mb-3">
                      {product.condition.replace(/_/g, ' ')}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-semibold ${!isAvailable ? 'text-gray-400' : 'text-gray-900'}`}>
                        {formatPrice(product.priceCents)}
                      </span>
                      {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPriceCents)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="px-4 pb-4 space-y-2">
                  {isAvailable && (
                    <Button
                      variant={isInCart ? 'outline' : 'primary'}
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={isInCart}
                    >
                      {isInCart ? (
                        <>In Cart</>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <ShareButton
                      url={`https://covet.com/products/${product.sku}`}
                      title={`${product.brand} - ${product.title}`}
                      description={product.description}
                      image={primaryImage?.url}
                      variant="button"
                      className="flex-1 justify-center text-sm"
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
