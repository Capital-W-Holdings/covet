'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Container, Card, Button, Input, Select, Textarea, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';
import { TicketCategory } from '@/types/support';

const categoryOptions = [
  { value: TicketCategory.ORDER_ISSUE, label: 'Order Issue' },
  { value: TicketCategory.PAYMENT, label: 'Payment Question' },
  { value: TicketCategory.SHIPPING, label: 'Shipping & Delivery' },
  { value: TicketCategory.RETURNS, label: 'Returns & Refunds' },
  { value: TicketCategory.AUTHENTICATION, label: 'Authentication' },
  { value: TicketCategory.ACCOUNT, label: 'Account Help' },
  { value: TicketCategory.SELLER_QUESTION, label: 'Selling on Covet' },
  { value: TicketCategory.TECHNICAL, label: 'Technical Issue' },
  { value: TicketCategory.OTHER, label: 'Other' },
];

export default function ContactSupportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    category: TicketCategory.ORDER_ISSUE,
    subject: '',
    description: '',
    orderId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTicketNumber(data.data.ticketNumber);
      } else {
        setError(data.error?.message || 'Failed to submit ticket');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/support/contact');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-12 max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">
              Ticket Submitted
            </h1>
            <p className="text-gray-600 mb-6">
              Your support ticket has been created. We&apos;ll get back to you within 24 hours.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Ticket Number</p>
              <p className="text-lg font-mono font-medium text-gray-900">{ticketNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support/tickets">
                <Button variant="primary">View My Tickets</Button>
              </Link>
              <Link href="/support">
                <Button variant="outline">Back to Support</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12 max-w-2xl">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>

        <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-2">
          Contact Support
        </h1>
        <p className="text-gray-600 mb-8">
          Fill out the form below and we&apos;ll get back to you as soon as possible.
        </p>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="What can we help you with?"
              name="category"
              options={categoryOptions}
              value={formData.category}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief summary of your issue"
              required
            />

            <Input
              label="Order Number (optional)"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              placeholder="e.g., ORD-ABC123"
              helperText="If this relates to a specific order"
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              required
              placeholder="Please provide as much detail as possible..."
            />

            {/* Contact Info Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">We&apos;ll respond to:</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  );
}
