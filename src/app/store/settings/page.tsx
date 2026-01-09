'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { Container, Card, Button, Input, Textarea, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';

interface StoreSettings {
  name: string;
  slug: string;
  description: string;
  tagline: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  location?: string;
}

export default function StoreSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/store/dashboard');
        const data = await res.json();

        if (data.success && data.data.store) {
          const store = data.data.store;
          setSettings({
            name: store.name,
            slug: store.slug,
            description: store.description || '',
            tagline: store.tagline || '',
            logo: store.logo || '',
            coverImage: store.coverImage || '',
            contactEmail: store.contactEmail || '',
            contactPhone: store.contactPhone || '',
            website: store.website || '',
            location: store.location || '',
          });
        }
      } catch {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/store/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error?.message || 'Failed to save settings');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'STORE_ADMIN') {
    router.push('/login?redirect=/store/settings');
    return null;
  }

  if (!settings) {
    return (
      <Container className="py-16">
        <p className="text-center text-gray-500">Store not found</p>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 max-w-3xl">
        <Link
          href="/store"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-light text-gray-900 mb-8">Store Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                required
              />
              <Input
                label="Store URL"
                value={settings.slug}
                disabled
                helperText="Store URL cannot be changed"
              />
              <Input
                label="Tagline"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="A short description of your store"
                maxLength={100}
              />
              <Textarea
                label="Description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={4}
                placeholder="Tell buyers about your store, your expertise, and what makes you special"
                maxLength={1000}
              />
            </div>
          </Card>

          {/* Branding */}
          <Card className="p-6">
            <h2 className="font-medium text-gray-900 mb-4">Branding</h2>
            <div className="space-y-4">
              <Input
                label="Logo URL"
                type="url"
                value={settings.logo || ''}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                helperText="Recommended: 200x200px square image"
              />
              <Input
                label="Cover Image URL"
                type="url"
                value={settings.coverImage || ''}
                onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                helperText="Recommended: 1200x400px banner image"
              />
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h2 className="font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <Input
                label="Contact Email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                required
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
              <Input
                label="Website"
                type="url"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
              <Input
                label="Location"
                value={settings.location || ''}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="New York, NY"
              />
            </div>
          </Card>

          {/* Actions */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Settings saved successfully!
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
