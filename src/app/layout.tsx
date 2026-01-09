import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';

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
  themeColor: '#020912',
};

// Static header with logo
function StaticHeader() {
  return (
    <header className="bg-brand-offwhite border-b-2 border-brand-navy sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.ibb.co/xSWg62rN/Covet-Logotype.webp"
              alt="Covet"
              className="h-8"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-sm font-mono uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity">Shop</Link>
            <Link href="/stores" className="text-sm font-mono uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity">Stores</Link>
            <Link href="/sell" className="text-sm font-mono uppercase tracking-wider text-brand-navy hover:opacity-60 transition-opacity">Sell</Link>
            <Link href="/login" className="text-sm font-mono uppercase tracking-wider text-brand-navy border-2 border-brand-navy px-6 py-2 hover:bg-brand-navy hover:text-white transition-colors">Sign In</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

// Static footer
function StaticFooter() {
  return (
    <footer className="bg-brand-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.ibb.co/xSWg62rN/Covet-Logotype.webp"
              alt="Covet"
              className="h-6 brightness-0 invert mb-4"
            />
            <p className="font-mono text-sm text-gray-400 max-w-sm">
              Boston&apos;s premier destination for authenticated luxury consignment since 2015.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 font-mono text-sm text-gray-400">
              <li><Link href="/shop?category=HANDBAGS" className="hover:text-white transition-colors">Handbags</Link></li>
              <li><Link href="/shop?category=WATCHES" className="hover:text-white transition-colors">Watches</Link></li>
              <li><Link href="/shop?category=JEWELRY" className="hover:text-white transition-colors">Jewelry</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 font-mono text-sm text-gray-400">
              <li><Link href="/stores" className="hover:text-white transition-colors">Our Stores</Link></li>
              <li><Link href="/sell" className="hover:text-white transition-colors">Consign With Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="font-mono text-xs text-gray-500">© 2025 Covet. All rights reserved.</p>
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
      <body className="min-h-screen flex flex-col bg-brand-offwhite">
        <ClientProviders>
          <StaticHeader />
          <main className="flex-1">{children}</main>
          <StaticFooter />
        </ClientProviders>
      </body>
    </html>
  );
}
