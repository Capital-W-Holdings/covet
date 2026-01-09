'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Button, Input, Card } from '@/components/ui';
import { SocialLoginButtons, AuthDivider } from '@/components/auth/SocialLoginButtons';
import { useAuth } from '@/hooks';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login({ email, password });

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleSocialSuccess = async () => {
    // Refresh session after social login
    await refreshUser();
    router.push(redirect);
  };

  const handleSocialError = (_provider: string, errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp"
              alt="Covet"
              width={120}
              height={32}
              className="h-8 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-light text-gray-900 text-center mb-6">
            Welcome Back
          </h1>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            mode="login"
            onSuccess={handleSocialSuccess}
            onError={handleSocialError}
            disabled={loading}
          />

          <AuthDivider className="my-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-brand-gold hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">Demo Accounts</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Admin</span>
                <span className="font-mono">admin@covet.com / Admin123!</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Buyer</span>
                <span className="font-mono">buyer@test.com / Buyer123!</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  );
}
