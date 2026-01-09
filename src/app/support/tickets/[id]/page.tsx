'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Shield, Clock } from 'lucide-react';
import { Container, Card, Button, Badge, Textarea, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { SupportTicket } from '@/types/support';
import { TicketStatus } from '@/types/support';

const statusColors: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [TicketStatus.OPEN]: 'warning',
  [TicketStatus.IN_PROGRESS]: 'default',
  [TicketStatus.AWAITING_CUSTOMER]: 'warning',
  [TicketStatus.RESOLVED]: 'success',
  [TicketStatus.CLOSED]: 'default',
};

const statusLabels: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Open',
  [TicketStatus.IN_PROGRESS]: 'In Progress',
  [TicketStatus.AWAITING_CUSTOMER]: 'Awaiting Your Reply',
  [TicketStatus.RESOLVED]: 'Resolved',
  [TicketStatus.CLOSED]: 'Closed',
};

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

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/support/tickets/${id}`);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push(`/login?redirect=/support/tickets/${id}`);
    return null;
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-12">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-medium text-gray-900 mb-2">Ticket Not Found</h1>
            <p className="text-gray-600 mb-4">This ticket doesn&apos;t exist or you don&apos;t have access.</p>
            <Link href="/support/tickets">
              <Button>View My Tickets</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const isClosed = ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12 max-w-3xl">
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>

        {/* Ticket Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-gray-400">{ticket.ticketNumber}</span>
                <Badge variant={statusColors[ticket.status]}>
                  {statusLabels[ticket.status]}
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
            {ticket.orderId && (
              <span>
                Order: <span className="font-mono">{ticket.orderId}</span>
              </span>
            )}
          </div>
        </Card>

        {/* Original Description */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{ticket.userName}</span>
                <span className="text-xs text-gray-400">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
        </Card>

        {/* Messages */}
        {ticket.messages.length > 0 && (
          <div className="space-y-4 mb-6">
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
                          <Badge variant="default" className="text-xs">Support Team</Badge>
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
            <h3 className="font-medium text-gray-900 mb-4">Send a Reply</h3>
            <form onSubmit={handleSendReply}>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                disabled={sending}
              />
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
              <div className="flex justify-end mt-4">
                <Button type="submit" loading={sending} disabled={sending || !replyMessage.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 text-center bg-gray-50">
            <p className="text-gray-500">
              This ticket has been {ticket.status === TicketStatus.RESOLVED ? 'resolved' : 'closed'}.
              Need more help? <Link href="/support/contact" className="text-black underline">Open a new ticket</Link>
            </p>
          </Card>
        )}
      </Container>
    </div>
  );
}
