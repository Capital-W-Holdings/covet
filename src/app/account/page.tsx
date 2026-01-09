'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, Settings, LogOut, AlertCircle, Star, Store } from 'lucide-react';
import { Container, Button, Card, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';

const menuItems = [
  {
    href: '/account/orders',
    icon: Package,
    title: 'Orders',
    description: 'View your order history',
  },
  {
    href: '/account/disputes',
    icon: AlertCircle,
    title: 'Disputes',
    description: 'Manage order issues',
  },
  {
    href: '/account/wishlist',
    icon: Heart,
    title: 'Wishlist',
    description: 'Items you\'ve saved',
  },
  {
    href: '/account/settings',
    icon: Settings,
    title: 'Settings',
    description: 'Manage your account',
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/account');
    return null;
  }

  const isCovetAdmin = user.role === 'COVET_ADMIN' || user.role === 'SUPER_ADMIN';
  const isStoreAdmin = user.role === 'STORE_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-8">My Account</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-brand-gold" />
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">{user.profile.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Role:</span>{' '}
                  {user.role.replace(/_/g, ' ')}
                </p>
                <p>
                  <span className="font-medium">Member since:</span>{' '}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <hr className="my-6" />

              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card hover className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <item.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Role-based Links */}
            <div className="mt-8 space-y-3">
              {isStoreAdmin && (
                <Link href="/store">
                  <Button variant="outline" className="w-full">
                    <Store className="w-4 h-4 mr-2" />
                    Go to Seller Dashboard
                  </Button>
                </Link>
              )}
              {isCovetAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              )}
              {!isStoreAdmin && !isCovetAdmin && (
                <Link href="/sell">
                  <Button variant="outline" className="w-full">
                    <Store className="w-4 h-4 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
