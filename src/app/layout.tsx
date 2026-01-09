import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { QuickViewProvider } from '@/components/ui/QuickViewModal';

export const metadata: Metadata = {
  title: {
    default: 'Covet | Luxury Authenticated Consignment',
    template: '%s | Covet',
  },
  description: "Boston's premier destination for authenticated luxury consignment.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a1a',
};

// Static header - no hooks
function StaticHeader() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-semibold text-gray-900">
            COVET
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900">Shop</Link>
            <Link href="/stores" className="text-sm font-medium text-gray-600 hover:text-gray-900">Stores</Link>
            <Link href="/sell" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sell</Link>
            <Link href="/login" className="text-sm font-medium text-gray-900 border border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white transition-colors">Sign In</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

// Static footer
function StaticFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-2">COVET</p>
          <p className="text-gray-400">Luxury, Authenticated.</p>
          <p className="text-gray-500 text-sm mt-4">© 2025 Covet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <StaticHeader />
                <main className="flex-1">{children}</main>
                <StaticFooter />
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
