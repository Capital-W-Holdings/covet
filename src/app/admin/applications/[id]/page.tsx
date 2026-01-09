'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Store, MapPin, Globe, Instagram, Check, X, AlertCircle } from 'lucide-react';
import { Container, Card, Badge, Spinner, EmptyState, Button, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks';
import { formatDateTime, formatPrice } from '@/lib/utils';
import type { StoreApplication } from '@/types/store';
import { StoreApplicationStatus } from '@/types/store';

const statusColors: Record<StoreApplicationStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [StoreApplicationStatus.PENDING]: 'warning',
  [StoreApplicationStatus.UNDER_REVIEW]: 'default',
  [StoreApplicationStatus.APPROVED]: 'success',
  [StoreApplicationStatus.REJECTED]: 'danger',
  [StoreApplicationStatus.NEEDS_INFO]: 'warning',
};

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [application, setApplication] = useState<StoreApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/admin/applications/${applicationId}`);
        const data = await res.json();

        if (data.success) {
          setApplication(data.data);
          if (data.data.reviewNotes) {
            setReviewNotes(data.data.reviewNotes);
          }
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user && applicationId) {
      fetchApplication();
    }
  }, [user, applicationId]);

  const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO' | 'UNDER_REVIEW') => {
    if (status !== 'APPROVED' && status !== 'UNDER_REVIEW' && !reviewNotes) {
      setError('Please provide review notes');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes }),
      });

      const data = await res.json();

      if (data.success) {
        if (status === 'APPROVED') {
          router.push('/admin/applications?status=APPROVED');
        } else {
          setApplication(data.data.application || data.data);
        }
      } else {
        setError(data.error?.message || 'Action failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
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
    router.push('/login?redirect=/admin/applications');
    return null;
  }

  if (!application) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Application not found"
          description="The application you're looking for doesn't exist."
          action={
            <Link href="/admin/applications">
              <Button>Back to Applications</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const canReview = application.status === StoreApplicationStatus.PENDING || 
                    application.status === StoreApplicationStatus.UNDER_REVIEW;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/applications"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Applications
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-light text-gray-900">{application.businessName}</h1>
            <Badge variant={statusColors[application.status]}>
              {application.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-gray-500">Applied {formatDateTime(application.createdAt)}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Info */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Business Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Legal Name</span>
                  <p className="font-medium text-gray-900">{application.legalName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Business Type</span>
                  <p className="font-medium text-gray-900">
                    {application.businessType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Years in Business</span>
                  <p className="font-medium text-gray-900">{application.yearsInBusiness} years</p>
                </div>
                {application.taxId && (
                  <div>
                    <span className="text-gray-500">Tax ID</span>
                    <p className="font-medium text-gray-900">{application.taxId}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-gray-500 text-sm">Description</span>
                <p className="text-gray-900 mt-1">{application.description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {application.website && (
                  <a
                    href={application.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-brand-gold hover:underline"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </a>
                )}
                {application.instagram && (
                  <a
                    href={`https://instagram.com/${application.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-brand-gold hover:underline"
                  >
                    <Instagram className="w-4 h-4 mr-1" />
                    {application.instagram}
                  </a>
                )}
              </div>
            </Card>

            {/* Inventory & Categories */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Inventory & Categories</h2>

              <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Estimated Inventory</span>
                  <p className="font-medium text-gray-900">{application.estimatedInventory} items</p>
                </div>
                <div>
                  <span className="text-gray-500">Est. Monthly GMV</span>
                  <p className="font-medium text-gray-900">
                    {formatPrice(application.estimatedMonthlyGMV * 100)}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Categories</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {application.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Location */}
            {application.hasPhysicalLocation && application.physicalAddress && (
              <Card className="p-6">
                <h2 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Physical Location
                </h2>
                <div className="text-sm text-gray-600">
                  <p>{application.physicalAddress.street1}</p>
                  {application.physicalAddress.street2 && (
                    <p>{application.physicalAddress.street2}</p>
                  )}
                  <p>
                    {application.physicalAddress.city}, {application.physicalAddress.state}{' '}
                    {application.physicalAddress.postalCode}
                  </p>
                  <p>{application.physicalAddress.country}</p>
                </div>
              </Card>
            )}

            {/* Review Section */}
            {canReview && (
              <Card className="p-6">
                <h2 className="font-medium text-gray-900 mb-4">Review Application</h2>

                <Textarea
                  label="Review Notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this application..."
                />

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleAction('APPROVED')}
                    loading={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction('REJECTED')}
                    loading={submitting}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction('NEEDS_INFO')}
                    loading={submitting}
                    variant="outline"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Request Info
                  </Button>
                </div>
              </Card>
            )}

            {/* Previous Review */}
            {application.reviewNotes && !canReview && (
              <Card className="p-6">
                <h2 className="font-medium text-gray-900 mb-4">Review Notes</h2>
                <p className="text-gray-600">{application.reviewNotes}</p>
                {application.reviewedAt && (
                  <p className="text-sm text-gray-400 mt-2">
                    Reviewed {formatDateTime(application.reviewedAt)}
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="text-gray-900">
                    <a
                      href={`mailto:${application.contactEmail}`}
                      className="text-brand-gold hover:underline"
                    >
                      {application.contactEmail}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="text-gray-900">
                    <a
                      href={`tel:${application.contactPhone}`}
                      className="text-brand-gold hover:underline"
                    >
                      {application.contactPhone}
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h2 className="font-medium text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300" />
                  <div>
                    <p className="text-gray-900">Application Submitted</p>
                    <p className="text-gray-500">{formatDateTime(application.createdAt)}</p>
                  </div>
                </div>
                {application.reviewedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300" />
                    <div>
                      <p className="text-gray-900">{application.status.replace(/_/g, ' ')}</p>
                      <p className="text-gray-500">{formatDateTime(application.reviewedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
