import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { QuickViewProvider } from '@/components/ui/QuickViewModal';

export const metadata: Metadata = {
  title: {
    default: 'Covet | Luxury Authenticated Consignment',
    template: '%s | Covet',
  },
  description: "Boston's premier destination for authenticated luxury consignment. Shop pre-owned designer handbags, watches, and jewelry with confidence.",
  keywords: ['luxury consignment', 'designer bags', 'authenticated luxury', 'pre-owned watches', 'consignment boston'],
  authors: [{ name: 'Covet' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://covet.com',
    siteName: 'Covet',
    title: 'Covet | Luxury Authenticated Consignment',
    description: "Boston's premier destination for authenticated luxury consignment.",
    images: [
      {
        url: 'https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp',
        width: 1200,
        height: 630,
        alt: 'Covet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Covet | Luxury Authenticated Consignment',
    description: "Boston's premier destination for authenticated luxury consignment.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a1a1a',
};

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
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
