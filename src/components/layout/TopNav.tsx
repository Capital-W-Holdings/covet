'use client';

import { useState } from 'react';
import Link from 'next/link';

const clothingCategories = [
  { name: 'Dresses', href: '/shop?category=DRESSES' },
  { name: 'Tops & Blouses', href: '/shop?category=TOPS' },
  { name: 'Coats & Jackets', href: '/shop?category=OUTERWEAR' },
  { name: 'Pants & Jeans', href: '/shop?category=PANTS' },
  { name: 'Skirts', href: '/shop?category=SKIRTS' },
  { name: 'Sweaters', href: '/shop?category=SWEATERS' },
];

const accessoriesCategories = [
  { name: 'Handbags', href: '/shop?category=HANDBAGS' },
  { name: 'Shoes', href: '/shop?category=SHOES' },
  { name: 'Jewelry', href: '/shop?category=JEWELRY' },
  { name: 'Watches', href: '/shop?category=WATCHES' },
  { name: 'Belts & Scarves', href: '/shop?category=ACCESSORIES' },
];

export function TopNav() {
  const [clothingOpen, setClothingOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.ibb.co/xSWg62rN/Covet-Logotype.webp"
              alt="Covet"
              className="h-6 w-auto"
            />
          </Link>

          {/* Center Navigation */}
          <nav className="flex items-center gap-8">
            <Link href="/shop" className="font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors">
              Shop All
            </Link>

            {/* Clothing Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setClothingOpen(true)}
              onMouseLeave={() => setClothingOpen(false)}
            >
              <button className="flex items-center gap-1 font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors h-16">
                Clothing
                <svg className={`w-4 h-4 transition-transform ${clothingOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 w-48 ${clothingOpen ? 'block' : 'hidden'}`}>
                {/* Invisible bridge to prevent gap */}
                <div className="h-1" />
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  {clothingCategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2.5 font-mono text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Accessories Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setAccessoriesOpen(true)}
              onMouseLeave={() => setAccessoriesOpen(false)}
            >
              <button className="flex items-center gap-1 font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors h-16">
                Accessories
                <svg className={`w-4 h-4 transition-transform ${accessoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 w-48 ${accessoriesOpen ? 'block' : 'hidden'}`}>
                {/* Invisible bridge to prevent gap */}
                <div className="h-1" />
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  {accessoriesCategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2.5 font-mono text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-navy transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/stores" className="font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors">
              Stores
            </Link>

            <Link href="/sell" className="font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors">
              Sell With Us
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-mono text-sm text-gray-700 hover:text-brand-navy transition-colors">
              Sign In
            </Link>
            <Link
              href="/shop"
              className="bg-brand-navy text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
