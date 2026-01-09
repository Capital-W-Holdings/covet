'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { Dispute } from '@/types/review';
import { DisputeStatus, DisputeReason } from '@/types/review';

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
  [DisputeReason.NOT_AS_DESCRIBED]: 'Item Not as Described',
  [DisputeReason.AUTHENTICATION_CONCERN]: 'Authentication Concern',
  [DisputeReason.DAMAGED_IN_SHIPPING]: 'Damaged in Shipping',
  [DisputeReason.NOT_RECEIVED]: 'Item Not Received',
  [DisputeReason.WRONG_ITEM]: 'Wrong Item Received',
  [DisputeReason.OTHER]: 'Other',
};

export default function DisputesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisputes() {
      try {
        const res = await fetch('/api/disputes');
        const data = await res.json();

        if (data.success) {
          setDisputes(data.data);
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
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/account/disputes');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="mb-8">
          <Link href="/account" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
            ← Back to Account
          </Link>
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900">My Disputes</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="w-16 h-16" />}
            title="No disputes"
            description="You haven't filed any disputes. We hope you never need to!"
            action={
              <Link href="/account/orders">
                <Button variant="outline">View Orders</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const StatusIcon = statusIcons[dispute.status];

              return (
                <Link key={dispute.id} href={`/account/disputes/${dispute.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {reasonLabels[dispute.reason]}
                          </h3>
                          <Badge variant={statusColors[dispute.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {dispute.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {dispute.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Opened {formatDateTime(dispute.createdAt)}
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
