'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Check, ArrowRight, ChevronLeft } from 'lucide-react';
import { Container, Button, Input, Select, Textarea, Card, Spinner } from '@/components/ui';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useAuth } from '@/hooks';
import { ProductCategory } from '@/types';
import type { StoreApplication } from '@/types/store';

const businessTypes = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
  { value: 'LLC', label: 'LLC' },
  { value: 'CORPORATION', label: 'Corporation' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
];

const categoryOptions = [
  { value: ProductCategory.HANDBAGS, label: 'Handbags' },
  { value: ProductCategory.WATCHES, label: 'Watches' },
  { value: ProductCategory.JEWELRY, label: 'Jewelry' },
  { value: ProductCategory.ACCESSORIES, label: 'Accessories' },
  { value: ProductCategory.CLOTHING, label: 'Clothing' },
  { value: ProductCategory.SHOES, label: 'Shoes' },
];

const benefits = [
  'Access to thousands of qualified buyers',
  'Covet authentication backing',
  'Integrated payment processing',
  'Marketing & promotional support',
  'Seller dashboard & analytics',
  'Dedicated account manager',
];

const applicationSteps = [
  { label: 'Business Info', description: 'About your business' },
  { label: 'Inventory', description: 'What you sell' },
  { label: 'Contact', description: 'How to reach you' },
];

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [existingApplication, setExistingApplication] = useState<StoreApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    businessName: '',
    legalName: '',
    businessType: 'LLC' as const,
    taxId: '',
    website: '',
    instagram: '',
    description: '',
    yearsInBusiness: 0,
    estimatedInventory: 10,
    estimatedMonthlyGMV: 10000,
    categories: [] as string[],
    hasPhysicalLocation: false,
    physicalAddress: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch('/api/stores/apply');
        const data = await res.json();
        if (data.success && data.data) {
          setExistingApplication(data.data);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      setFormData((prev) => ({ ...prev, contactEmail: user.email }));
      checkExisting();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('physicalAddress.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        physicalAddress: { ...prev.physicalAddress, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/stores/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setExistingApplication(data.data);
      } else {
        setError(data.error?.message || 'Failed to submit application');
      }
    } catch {
      setError('An error occurred. Please try again.');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <Store className="w-16 h-16 text-brand-gold mx-auto mb-6" />
            <h1 className="text-2xl font-light text-gray-900 mb-4">
              Become a Covet Seller
            </h1>
            <p className="text-gray-600 mb-8">
              Sign in or create an account to apply for a seller account.
            </p>
            <Link href="/login?redirect=/sell">
              <Button size="lg">Sign In to Apply</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            {existingApplication.status === 'APPROVED' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-4">
                  Application Approved!
                </h1>
                <p className="text-gray-600 mb-8">
                  Your seller account is ready. Start managing your store.
                </p>
                <Link href="/store">
                  <Button size="lg">Go to Store Dashboard</Button>
                </Link>
              </>
            ) : existingApplication.status === 'REJECTED' ? (
              <>
                <h1 className="text-2xl font-light text-gray-900 mb-4">
                  Application Not Approved
                </h1>
                <p className="text-gray-600 mb-4">
                  Unfortunately, your application was not approved at this time.
                </p>
                {existingApplication.reviewNotes && (
                  <Card className="p-4 mb-8 text-left">
                    <p className="text-sm text-gray-600">{existingApplication.reviewNotes}</p>
                  </Card>
                )}
                <Link href="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </>
            ) : existingApplication.status === 'NEEDS_INFO' ? (
              <>
                <h1 className="text-2xl font-light text-gray-900 mb-4">
                  Additional Information Needed
                </h1>
                <p className="text-gray-600 mb-4">
                  We need more information to process your application.
                </p>
                {existingApplication.reviewNotes && (
                  <Card className="p-4 mb-8 text-left">
                    <p className="text-sm text-gray-600">{existingApplication.reviewNotes}</p>
                  </Card>
                )}
                <Link href="/contact">
                  <Button>Respond to Request</Button>
                </Link>
              </>
            ) : (
              <>
                <Spinner size="lg" className="mx-auto mb-6" />
                <h1 className="text-2xl font-light text-gray-900 mb-4">
                  Application Under Review
                </h1>
                <p className="text-gray-600 mb-4">
                  Thank you for applying! We're reviewing your application and will
                  be in touch within 2-3 business days.
                </p>
                <Card className="p-4 text-left">
                  <h3 className="font-medium text-gray-900 mb-2">{existingApplication.businessName}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              </>
            )}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-charcoal text-white py-16">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-light mb-4">
              Sell on Covet
            </h1>
            <p className="text-lg text-gray-300">
              Join the most trusted marketplace for authenticated luxury consignment.
              Reach thousands of qualified buyers looking for pieces like yours.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-medium text-gray-900 mb-4">Why Sell on Covet?</h2>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <hr className="my-6" />

              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">Commission Structure</p>
                <p className="mb-2">
                  <span className="text-2xl font-semibold text-brand-gold">6%</span>
                  <span className="text-gray-500"> platform fee</span>
                </p>
                <p className="text-xs">Plus $199/month subscription for partner stores</p>
              </div>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 lg:p-8">
              {/* Progress Indicator */}
              <StepIndicator steps={applicationSteps} currentStep={step} />

              <form onSubmit={handleSubmit}>
                {/* Step 1: Business Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">Business Information</h2>
                      <p className="text-sm text-gray-500">Tell us about your business</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Business Name"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Legal Name"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        label="Business Type"
                        name="businessType"
                        options={businessTypes}
                        value={formData.businessType}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Tax ID (optional)"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Textarea
                      label="Business Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      helperText="Minimum 50 characters. Tell us about your experience in luxury resale."
                      required
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Website (optional)"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://"
                      />
                      <Input
                        label="Instagram (optional)"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        placeholder="@username"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.businessName || !formData.legalName || formData.description.length < 50}
                      className="w-full"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Inventory & Categories */}
                {step === 2 && (
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>

                    <div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">Inventory & Categories</h2>
                      <p className="text-sm text-gray-500">What do you sell?</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input
                        label="Years in Business"
                        name="yearsInBusiness"
                        type="number"
                        min="0"
                        value={formData.yearsInBusiness}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Estimated Inventory"
                        name="estimatedInventory"
                        type="number"
                        min="1"
                        value={formData.estimatedInventory}
                        onChange={handleInputChange}
                        helperText="Number of items"
                      />
                      <Input
                        label="Est. Monthly GMV"
                        name="estimatedMonthlyGMV"
                        type="number"
                        min="0"
                        value={formData.estimatedMonthlyGMV}
                        onChange={handleInputChange}
                        helperText="In USD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Categories (select all that apply)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categoryOptions.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryToggle(cat.value)}
                            className={`p-3 border rounded-lg text-sm text-left transition-colors ${
                              formData.categories.includes(cat.value)
                                ? 'border-brand-gold bg-brand-cream text-brand-charcoal'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={formData.categories.length === 0}
                      className="w-full"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 3: Contact & Location */}
                {step === 3 && (
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>

                    <div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">Contact Information</h2>
                      <p className="text-sm text-gray-500">How can we reach you?</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Contact Email"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Contact Phone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.hasPhysicalLocation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, hasPhysicalLocation: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        I have a physical retail location
                      </label>
                    </div>

                    {formData.hasPhysicalLocation && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <Input
                          label="Street Address"
                          name="physicalAddress.street1"
                          value={formData.physicalAddress.street1}
                          onChange={handleInputChange}
                        />
                        <Input
                          label="Suite/Unit (optional)"
                          name="physicalAddress.street2"
                          value={formData.physicalAddress.street2}
                          onChange={handleInputChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="City"
                            name="physicalAddress.city"
                            value={formData.physicalAddress.city}
                            onChange={handleInputChange}
                          />
                          <Input
                            label="State"
                            name="physicalAddress.state"
                            value={formData.physicalAddress.state}
                            onChange={handleInputChange}
                          />
                        </div>
                        <Input
                          label="ZIP Code"
                          name="physicalAddress.postalCode"
                          value={formData.physicalAddress.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      loading={submitting}
                      disabled={!formData.contactEmail || !formData.contactPhone}
                      className="w-full"
                    >
                      Submit Application
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you agree to our{' '}
                      <a href="/terms" className="underline">Seller Terms</a> and{' '}
                      <a href="/privacy" className="underline">Privacy Policy</a>.
                    </p>
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
