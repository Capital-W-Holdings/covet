'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Container, Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
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

const statusIcons: Record<TicketStatus, typeof Clock> = {
  [TicketStatus.OPEN]: Clock,
  [TicketStatus.IN_PROGRESS]: AlertCircle,
  [TicketStatus.AWAITING_CUSTOMER]: MessageCircle,
  [TicketStatus.RESOLVED]: CheckCircle,
  [TicketStatus.CLOSED]: CheckCircle,
};

const statusLabels: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Open',
  [TicketStatus.IN_PROGRESS]: 'In Progress',
  [TicketStatus.AWAITING_CUSTOMER]: 'Awaiting Your Reply',
  [TicketStatus.RESOLVED]: 'Resolved',
  [TicketStatus.CLOSED]: 'Closed',
};

export default function UserTicketsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch('/api/support/tickets');
        const data = await res.json();

        if (data.success) {
          setTickets(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTickets();
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
    router.push('/login?redirect=/support/tickets');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">My Tickets</h1>
            <p className="text-gray-500">{tickets.length} support requests</p>
          </div>
          <Link href="/support/contact">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-16 h-16" />}
            title="No support tickets"
            description="You haven't submitted any support requests yet."
            action={
              <Link href="/support/contact">
                <Button>Contact Support</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon = statusIcons[ticket.status];
              const needsAttention = ticket.status === TicketStatus.AWAITING_CUSTOMER;

              return (
                <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
                  <Card hover className={`p-4 ${needsAttention ? 'border-amber-200 bg-amber-50/50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        needsAttention ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          needsAttention ? 'text-amber-600' : 'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gray-400">
                            {ticket.ticketNumber}
                          </span>
                          <Badge variant={statusColors[ticket.status]}>
                            {statusLabels[ticket.status]}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">
                          {ticket.messages.length} messages &bull; Updated {formatDateTime(ticket.updatedAt)}
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
