'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { Dispute } from '@/types/review';
import { DisputeStatus, DisputeReason } from '@/types/review';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: DisputeStatus.OPEN, label: 'Open' },
  { value: DisputeStatus.SELLER_RESPONSE, label: 'Seller Response' },
  { value: DisputeStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: DisputeStatus.RESOLVED, label: 'Resolved' },
  { value: DisputeStatus.CLOSED, label: 'Closed' },
];

const statusColors: Record<DisputeStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [DisputeStatus.OPEN]: 'warning',
  [DisputeStatus.SELLER_RESPONSE]: 'default',
  [DisputeStatus.UNDER_REVIEW]: 'default',
  [DisputeStatus.RESOLVED]: 'success',
  [DisputeStatus.CLOSED]: 'default',
};

const statusIcons: Record<DisputeStatus, typeof Clock> = {
  [DisputeStatus.OPEN]: Clock,
  [DisputeStatus.SELLER_RESPONSE]: Clock,
  [DisputeStatus.UNDER_REVIEW]: AlertCircle,
  [DisputeStatus.RESOLVED]: CheckCircle,
  [DisputeStatus.CLOSED]: XCircle,
};

const reasonLabels: Record<DisputeReason, string> = {
  [DisputeReason.NOT_AS_DESCRIBED]: 'Not as Described',
  [DisputeReason.AUTHENTICATION_CONCERN]: 'Auth Concern',
  [DisputeReason.DAMAGED_IN_SHIPPING]: 'Shipping Damage',
  [DisputeReason.NOT_RECEIVED]: 'Not Received',
  [DisputeReason.WRONG_ITEM]: 'Wrong Item',
  [DisputeReason.OTHER]: 'Other',
};

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchDisputes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);

        const res = await fetch(`/api/admin/disputes?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setDisputes(data.data.disputes);
          setOpenCount(data.data.openCount);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDisputes();
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
    router.push('/login?redirect=/admin/disputes');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Disputes</h1>
            <p className="text-gray-500">{disputes.length} total disputes</p>
          </div>
          {openCount > 0 && (
            <Badge variant="warning">{openCount} need attention</Badge>
          )}
        </div>

        <Card className="p-4 mb-6">
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-48"
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="w-16 h-16" />}
            title="No disputes"
            description="No disputes to review at this time."
          />
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const StatusIcon = statusIcons[dispute.status];

              return (
                <Link key={dispute.id} href={`/admin/disputes/${dispute.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="text-xs">
                            {reasonLabels[dispute.reason]}
                          </Badge>
                          <Badge variant={statusColors[dispute.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {dispute.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {dispute.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dispute.messages.length} messages • Opened {formatDateTime(dispute.createdAt)}
                        </p>
                      </div>

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
