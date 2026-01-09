'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Inbox,
  ArrowLeft,
} from 'lucide-react';
import { Container, Card, Button, Badge, Spinner, EmptyState, Select } from '@/components/ui';
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

const statusIcons: Record<TicketStatus, typeof Clock> = {
  [TicketStatus.OPEN]: Inbox,
  [TicketStatus.IN_PROGRESS]: Clock,
  [TicketStatus.AWAITING_CUSTOMER]: MessageCircle,
  [TicketStatus.RESOLVED]: CheckCircle,
  [TicketStatus.CLOSED]: CheckCircle,
};

const statusLabels: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Open',
  [TicketStatus.IN_PROGRESS]: 'In Progress',
  [TicketStatus.AWAITING_CUSTOMER]: 'Awaiting Customer',
  [TicketStatus.RESOLVED]: 'Resolved',
  [TicketStatus.CLOSED]: 'Closed',
};

const categoryLabels: Record<string, string> = {
  ORDER_ISSUE: 'Order',
  PAYMENT: 'Payment',
  SHIPPING: 'Shipping',
  RETURNS: 'Returns',
  AUTHENTICATION: 'Auth',
  ACCOUNT: 'Account',
  SELLER_QUESTION: 'Selling',
  TECHNICAL: 'Tech',
  OTHER: 'Other',
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.AWAITING_CUSTOMER, label: 'Awaiting Customer' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  awaitingCustomer: number;
  resolved: number;
}

export default function AdminSupportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);

        const res = await fetch(`/api/admin/support?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setTickets(data.data.tickets);
          setStats(data.data.stats);
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
  }, [user, statusFilter]);

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Support Tickets</h1>
            <p className="text-gray-500">Manage customer support requests</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </Card>
            <Card className="p-4 text-center bg-amber-50 border-amber-200">
              <p className="text-2xl font-semibold text-amber-600">{stats.open}</p>
              <p className="text-sm text-amber-600">Open</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </Card>
            <Card className="p-4 text-center bg-green-50 border-green-200">
              <p className="text-2xl font-semibold text-green-600">{stats.awaitingCustomer}</p>
              <p className="text-sm text-green-600">Awaiting Customer</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </Card>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-16 h-16" />}
            title="No tickets"
            description="No support tickets match your filters."
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const StatusIcon = statusIcons[ticket.status];
              const isUrgent = ticket.priority === TicketPriority.URGENT || ticket.priority === TicketPriority.HIGH;

              return (
                <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
                  <Card hover className={`p-4 ${isUrgent ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        ticket.status === TicketStatus.OPEN ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          ticket.status === TicketStatus.OPEN ? 'text-amber-600' : 'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs text-gray-400">
                            {ticket.ticketNumber}
                          </span>
                          <Badge variant={statusColors[ticket.status]}>
                            {statusLabels[ticket.status]}
                          </Badge>
                          <Badge variant={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="default">{categoryLabels[ticket.category]}</Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">
                          {ticket.userName} ({ticket.userEmail})
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 hidden md:block">
                        <p className="text-sm text-gray-500">
                          {ticket.messages.length} messages
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(ticket.updatedAt)}
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
