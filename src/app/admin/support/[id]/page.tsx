'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Container, Card, Button, Badge, Textarea, Spinner, Select } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { SupportTicket } from '@/types/support';
import { TicketStatus, TicketPriority } from '@/types/support';

const statusColors: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [TicketStatus.OPEN]: 'warning',
  [TicketStatus.IN_PROGRESS]: 'default',
  [TicketStatus.AWAITING_CUSTOMER]: 'success',
  [TicketStatus.RESOLVED]: 'success',
  [TicketStatus.CLOSED]: 'default',
};

const priorityColors: Record<TicketPriority, 'default' | 'success' | 'warning' | 'danger'> = {
  [TicketPriority.LOW]: 'default',
  [TicketPriority.MEDIUM]: 'default',
  [TicketPriority.HIGH]: 'warning',
  [TicketPriority.URGENT]: 'danger',
};

const statusOptions = [
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.AWAITING_CUSTOMER, label: 'Awaiting Customer' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

const priorityOptions = [
  { value: TicketPriority.LOW, label: 'Low' },
  { value: TicketPriority.MEDIUM, label: 'Medium' },
  { value: TicketPriority.HIGH, label: 'High' },
  { value: TicketPriority.URGENT, label: 'Urgent' },
];

const categoryLabels: Record<string, string> = {
  ORDER_ISSUE: 'Order Issue',
  PAYMENT: 'Payment',
  SHIPPING: 'Shipping',
  RETURNS: 'Returns',
  AUTHENTICATION: 'Authentication',
  ACCOUNT: 'Account',
  SELLER_QUESTION: 'Selling',
  TECHNICAL: 'Technical',
  OTHER: 'Other',
};

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/admin/support/${id}`);
        const data = await res.json();

        if (data.success) {
          setTicket(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user && id) {
      fetchTicket();
    }
  }, [user, id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });

      const data = await res.json();

      if (data.success) {
        setTicket(data.data);
        setReplyMessage('');
      } else {
        setError(data.error?.message || 'Failed to send reply');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateTicket = async (updates: { status?: TicketStatus; priority?: TicketPriority }) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/support');
    return null;
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-12">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-medium text-gray-900 mb-2">Ticket Not Found</h1>
            <Link href="/admin/support">
              <Button>Back to Support</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const isClosed = ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-400">{ticket.ticketNumber}</span>
                    <Badge variant={statusColors[ticket.status]}>
                      {ticket.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="default">{categoryLabels[ticket.category]}</Badge>
                  </div>
                  <h1 className="text-xl font-medium text-gray-900">{ticket.subject}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </Card>

            {/* Original Description */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{ticket.userName}</span>
                    <span className="text-xs text-gray-400">{ticket.userEmail}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>
            </Card>

            {/* Messages */}
            {ticket.messages.length > 0 && (
              <div className="space-y-4">
                {ticket.messages.map((message) => {
                  const isAdmin = message.senderRole === 'ADMIN';

                  return (
                    <Card key={message.id} className={`p-6 ${isAdmin ? 'bg-blue-50/50 border-blue-100' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAdmin ? 'bg-black' : 'bg-gray-100'
                        }`}>
                          {isAdmin ? (
                            <Shield className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{message.senderName}</span>
                            {isAdmin && (
                              <Badge variant="default" className="text-xs">Support</Badge>
                            )}
                            <span className="text-xs text-gray-400">{formatDateTime(message.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Reply Form */}
            {!isClosed ? (
              <Card className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Reply to Customer</h3>
                <form onSubmit={handleSendReply}>
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={4}
                    disabled={sending}
                  />
                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-gray-400">
                      Replying will set status to &quot;Awaiting Customer&quot;
                    </p>
                    <Button type="submit" loading={sending} disabled={sending || !replyMessage.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="p-6 text-center bg-green-50">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700">
                  This ticket has been {ticket.status === TicketStatus.RESOLVED ? 'resolved' : 'closed'}.
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Customer</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{ticket.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{ticket.userEmail}</p>
                </div>
                {ticket.orderId && (
                  <div>
                    <p className="text-sm text-gray-500">Related Order</p>
                    <p className="font-mono text-gray-900">{ticket.orderId}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Ticket Management */}
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Manage Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Status</label>
                  <Select
                    options={statusOptions}
                    value={ticket.status}
                    onChange={(e) => handleUpdateTicket({ status: e.target.value as TicketStatus })}
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Priority</label>
                  <Select
                    options={priorityOptions}
                    value={ticket.priority}
                    onChange={(e) => handleUpdateTicket({ priority: e.target.value as TicketPriority })}
                    disabled={updating}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {ticket.status !== TicketStatus.RESOLVED && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUpdateTicket({ status: TicketStatus.RESOLVED })}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Mark as Resolved
                  </Button>
                )}
                {ticket.status !== TicketStatus.CLOSED && ticket.status !== TicketStatus.RESOLVED && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUpdateTicket({ status: TicketStatus.CLOSED })}
                    disabled={updating}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2 text-gray-600" />
                    Close Ticket
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
