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
  maximumScale: 1,
  themeColor: '#020912',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-offwhite">
        <ClientProviders>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-brand-navy flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
              <Link href="/" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.ibb.co/xSWg62rN/Covet-Logotype.webp"
                  alt="Covet"
                  className="w-full max-w-[140px] h-auto brightness-0 invert"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6">
              <div className="space-y-1">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Home
                </Link>
                <Link href="/shop" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Shop All
                </Link>
              </div>

              <div className="mt-8">
                <p className="px-3 text-xs font-mono uppercase tracking-wider text-gray-600 mb-3">Categories</p>
                <div className="space-y-1">
                  <Link href="/shop?category=HANDBAGS" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    Handbags
                  </Link>
                  <Link href="/shop?category=WATCHES" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    Watches
                  </Link>
                  <Link href="/shop?category=JEWELRY" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    Jewelry
                  </Link>
                  <Link href="/shop?category=ACCESSORIES" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    Accessories
                  </Link>
                </div>
              </div>

              <div className="mt-8">
                <p className="px-3 text-xs font-mono uppercase tracking-wider text-gray-600 mb-3">More</p>
                <div className="space-y-1">
                  <Link href="/stores" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Our Stores
                  </Link>
                  <Link href="/sell" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Sell With Us
                  </Link>
                </div>
              </div>
            </nav>

            {/* Bottom */}
            <div className="p-6 border-t border-gray-800">
              <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Sign In
              </Link>
            </div>
          </aside>

          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 bg-brand-navy z-40 px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.ibb.co/xSWg62rN/Covet-Logotype.webp"
                  alt="Covet"
                  className="h-6 w-auto brightness-0 invert"
                />
              </Link>
              <Link href="/login" className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
            </div>
          </header>

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-navy z-40 px-2 pb-safe">
            <div className="flex items-center justify-around py-2">
              <Link href="/" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="text-xs font-mono">Home</span>
              </Link>
              <Link href="/shop" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <span className="text-xs font-mono">Shop</span>
              </Link>
              <Link href="/sell" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-mono">Sell</span>
              </Link>
              <Link href="/stores" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xs font-mono">Stores</span>
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
