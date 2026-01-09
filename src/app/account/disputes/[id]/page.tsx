'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, Send, User, Store, Shield, Check } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { Dispute, DisputeMessage } from '@/types/review';
import { DisputeStatus, DisputeReason, DisputeResolution } from '@/types/review';

const statusColors: Record<DisputeStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [DisputeStatus.OPEN]: 'warning',
  [DisputeStatus.SELLER_RESPONSE]: 'default',
  [DisputeStatus.UNDER_REVIEW]: 'default',
  [DisputeStatus.RESOLVED]: 'success',
  [DisputeStatus.CLOSED]: 'default',
};

const reasonLabels: Record<DisputeReason, string> = {
  [DisputeReason.NOT_AS_DESCRIBED]: 'Item Not as Described',
  [DisputeReason.AUTHENTICATION_CONCERN]: 'Authentication Concern',
  [DisputeReason.DAMAGED_IN_SHIPPING]: 'Damaged in Shipping',
  [DisputeReason.NOT_RECEIVED]: 'Item Not Received',
  [DisputeReason.WRONG_ITEM]: 'Wrong Item Received',
  [DisputeReason.OTHER]: 'Other',
};

const resolutionLabels: Record<DisputeResolution, string> = {
  [DisputeResolution.FULL_REFUND]: 'Full Refund',
  [DisputeResolution.PARTIAL_REFUND]: 'Partial Refund',
  [DisputeResolution.RETURN_AND_REFUND]: 'Return & Refund',
  [DisputeResolution.REPLACEMENT]: 'Replacement',
  [DisputeResolution.NO_ACTION]: 'No Action Taken',
  [DisputeResolution.BUYER_WITHDREW]: 'Buyer Withdrew',
};

const roleIcons: Record<string, typeof User> = {
  BUYER: User,
  SELLER: Store,
  ADMIN: Shield,
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchDispute() {
      try {
        const res = await fetch(`/api/disputes/${disputeId}`);
        const data = await res.json();

        if (data.success) {
          setDispute(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user && disputeId) {
      fetchDispute();
    }
  }, [user, disputeId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (data.success) {
        setDispute(data.data);
        setMessage('');
      }
    } catch {
      // Ignore
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
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

  if (!dispute) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Dispute not found"
          description="The dispute you're looking for doesn't exist."
          action={
            <Link href="/account/disputes">
              <Button>Back to Disputes</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const isResolved = dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="mb-8">
          <Link
            href="/account/disputes"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Disputes
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light text-gray-900">
              {reasonLabels[dispute.reason]}
            </h1>
            <Badge variant={statusColors[dispute.status]}>
              {dispute.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-gray-500">Opened {formatDateTime(dispute.createdAt)}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Description */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Issue Description
              </h2>
              <p className="text-gray-600">{dispute.description}</p>

              {dispute.evidence && dispute.evidence.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Evidence</h3>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidence.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-gold hover:underline"
                      >
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Resolution */}
            {isResolved && dispute.resolution && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h2 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Resolution
                </h2>
                <p className="text-green-800 font-medium">
                  {resolutionLabels[dispute.resolution]}
                </p>
                {dispute.resolutionNotes && (
                  <p className="text-green-700 mt-2">{dispute.resolutionNotes}</p>
                )}
                {dispute.resolvedAt && (
                  <p className="text-sm text-green-600 mt-2">
                    Resolved {formatDateTime(dispute.resolvedAt)}
                  </p>
                )}
              </Card>
            )}

            {/* Messages */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Conversation</h2>

              {dispute.messages.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No messages yet. Send a message to communicate with the seller.
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {dispute.messages.map((msg) => {
                    const Icon = roleIcons[msg.senderRole];
                    const isCurrentUser = msg.senderId === user.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`p-2 rounded-full flex-shrink-0 ${
                            msg.senderRole === 'ADMIN'
                              ? 'bg-purple-100'
                              : msg.senderRole === 'SELLER'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              msg.senderRole === 'ADMIN'
                                ? 'text-purple-600'
                                : msg.senderRole === 'SELLER'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div
                          className={`flex-1 max-w-[80%] ${
                            isCurrentUser ? 'text-right' : ''
                          }`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-brand-gold text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {msg.senderName} • {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Send Message */}
              {!isResolved && (
                <div className="flex gap-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!message.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Dispute Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="font-medium text-gray-900">
                    {dispute.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Reason</span>
                  <p className="font-medium text-gray-900">
                    {reasonLabels[dispute.reason]}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Order ID</span>
                  <p className="font-medium text-gray-900">
                    <Link
                      href={`/account/orders/${dispute.orderId}`}
                      className="text-brand-gold hover:underline"
                    >
                      View Order
                    </Link>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Need Help?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help resolve your issue as quickly as possible.
              </p>
              <a href="mailto:disputes@covet.com">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
