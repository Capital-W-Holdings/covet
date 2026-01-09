'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { StoreApplication } from '@/types/store';
import { StoreApplicationStatus } from '@/types/store';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: StoreApplicationStatus.PENDING, label: 'Pending' },
  { value: StoreApplicationStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: StoreApplicationStatus.APPROVED, label: 'Approved' },
  { value: StoreApplicationStatus.REJECTED, label: 'Rejected' },
  { value: StoreApplicationStatus.NEEDS_INFO, label: 'Needs Info' },
];

const statusColors: Record<StoreApplicationStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [StoreApplicationStatus.PENDING]: 'warning',
  [StoreApplicationStatus.UNDER_REVIEW]: 'default',
  [StoreApplicationStatus.APPROVED]: 'success',
  [StoreApplicationStatus.REJECTED]: 'danger',
  [StoreApplicationStatus.NEEDS_INFO]: 'warning',
};

const statusIcons: Record<StoreApplicationStatus, typeof Clock> = {
  [StoreApplicationStatus.PENDING]: Clock,
  [StoreApplicationStatus.UNDER_REVIEW]: Clock,
  [StoreApplicationStatus.APPROVED]: CheckCircle,
  [StoreApplicationStatus.REJECTED]: XCircle,
  [StoreApplicationStatus.NEEDS_INFO]: AlertCircle,
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<StoreApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);

        const res = await fetch(`/api/admin/applications?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setApplications(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchApplications();
    }
  }, [user, status]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/applications');
    return null;
  }

  const pendingCount = applications.filter(
    (a) => a.status === StoreApplicationStatus.PENDING
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Seller Applications</h1>
            <p className="text-gray-500">{applications.length} applications</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pending review</Badge>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-48"
          />
        </Card>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<Store className="w-16 h-16" />}
            title="No applications"
            description="Seller applications will appear here."
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const StatusIcon = statusIcons[app.status];
              return (
                <Link key={app.id} href={`/admin/applications/${app.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                        <Store className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{app.businessName}</h3>
                          <Badge variant={statusColors[app.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {app.businessType.replace(/_/g, ' ')} • {app.yearsInBusiness} years in business
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Applied {formatDateTime(app.createdAt)}
                        </p>
                      </div>

                      {/* Categories */}
                      <div className="hidden md:flex flex-wrap gap-1 flex-shrink-0">
                        {app.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {cat}
                          </span>
                        ))}
                        {app.categories.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{app.categories.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
