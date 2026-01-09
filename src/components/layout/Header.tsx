'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react';
import { Container, Button } from '@/components/ui';
import { SearchTrigger } from '@/components/ui/SearchModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'Handbags', href: '/shop?category=HANDBAGS' },
  { name: 'Watches', href: '/shop?category=WATCHES' },
  { name: 'Jewelry', href: '/shop?category=JEWELRY' },
  { name: 'Stores', href: '/stores' },
  { name: 'Sell', href: '/sell' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const isCovetAdmin = user?.role === 'COVET_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isStoreAdmin = user?.role === 'STORE_ADMIN';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp"
              alt="Covet"
              width={140}
              height={40}
              className="h-8 lg:h-10 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-gold',
                  pathname === item.href || pathname.startsWith(item.href + '?')
                    ? 'text-brand-charcoal'
                    : 'text-gray-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <SearchTrigger />

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 text-gray-600 hover:text-brand-charcoal transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-gray-600 hover:text-brand-charcoal transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                {isCovetAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {isStoreAdmin && (
                  <Link
                    href="/store"
                    className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
                  >
                    My Store
                  </Link>
                )}
                <Link
                  href="/account"
                  className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:block">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-base font-medium py-2',
                    pathname === item.href
                      ? 'text-brand-charcoal'
                      : 'text-gray-600'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <hr className="border-gray-200" />

              {user ? (
                <>
                  {isCovetAdmin && (
                    <Link
                      href="/admin"
                      className="text-base font-medium text-gray-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  {isStoreAdmin && (
                    <Link
                      href="/store"
                      className="text-base font-medium text-gray-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Store
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="text-base font-medium text-gray-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-base font-medium text-gray-600 py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-base font-medium text-brand-charcoal py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
