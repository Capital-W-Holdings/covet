'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { QuickViewProvider } from '@/components/ui/QuickViewModal';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Always render providers - they're needed for SSR prerendering
  // The blinking issue must be elsewhere
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <QuickViewProvider>
            {children}
          </QuickViewProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
