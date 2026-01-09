'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Button, Input, Card } from '@/components/ui';
import { SocialLoginButtons, AuthDivider } from '@/components/auth/SocialLoginButtons';
import { useAuth } from '@/hooks';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { register, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await register({ name, email, password });

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Registration failed');
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
            Create Account
          </h1>

          {/* Social Login Buttons */}
          <SocialLoginButtons
            mode="register"
            onSuccess={handleSocialSuccess}
            onError={handleSocialError}
            disabled={loading}
          />

          <AuthDivider className="my-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

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
              autoComplete="new-password"
              helperText="At least 8 characters with uppercase, lowercase, and number"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-brand-gold hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RegisterContent />
    </Suspense>
  );
}
