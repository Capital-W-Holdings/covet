'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Check, ArrowRight, ChevronLeft, Shield, TrendingUp, Users, DollarSign } from 'lucide-react';
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
  'Access to thousands of qualified luxury buyers',
  'Professional authentication & certification',
  'Secure integrated payment processing',
  'Marketing & promotional support',
  'Comprehensive seller dashboard & analytics',
  'Dedicated account manager',
];

const whyPartner = [
  {
    icon: Users,
    title: 'Expand Your Reach',
    description: 'Tap into our growing community of 10,000+ authenticated luxury buyers actively searching for consignment pieces. Our platform brings qualified customers directly to your inventory.',
  },
  {
    icon: Shield,
    title: 'Trust & Credibility',
    description: 'Every item sold through Covet carries our authentication guarantee. Buyers trust our verification process, leading to faster sales and fewer returns.',
  },
  {
    icon: TrendingUp,
    title: 'Boost Your Sales',
    description: 'Partners see an average 35% increase in monthly sales after joining Covet. Our marketing team promotes your inventory across social media, email, and search.',
  },
  {
    icon: DollarSign,
    title: 'Keep More Profit',
    description: 'Our industry-low 6% commission means you keep more of every sale. No hidden fees, no listing costs, no monthly minimums for individual sellers.',
  },
];

const detailedBenefits = [
  {
    title: 'Professional Marketing & Exposure',
    points: [
      'Featured placement in our weekly email newsletters reaching 25,000+ subscribers',
      'Social media promotion across Instagram, Facebook, and Pinterest',
      'SEO-optimized product listings that rank in Google search results',
      'Inclusion in seasonal campaigns and luxury shopping guides',
      'Cross-promotion with other partner stores to share audiences',
    ],
  },
  {
    title: 'Streamlined Operations',
    points: [
      'Easy-to-use seller dashboard to manage inventory and track sales',
      'Automated order notifications and shipping label generation',
      'Real-time analytics showing views, favorites, and conversion rates',
      'Bulk upload tools for adding multiple items quickly',
      'Integration with your existing POS and inventory systems',
    ],
  },
  {
    title: 'Expert Support & Services',
    points: [
      'Dedicated account manager for stores with 50+ items',
      'Professional photography services available in select cities',
      'Authentication support from our team of luxury experts',
      'Pricing guidance based on market data and recent sales',
      'Training and onboarding to maximize your success',
    ],
  },
  {
    title: 'Financial Benefits',
    points: [
      'Fast payouts within 48 hours of confirmed delivery',
      'Transparent commission structure with no hidden fees',
      'No monthly subscription fees for individual sellers',
      'Volume discounts for high-performing partners',
      'Secure payment processing with fraud protection',
    ],
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Apply to Join',
    description: 'Complete our simple application. We review your business and inventory to ensure quality standards.',
  },
  {
    step: '02',
    title: 'List Your Items',
    description: 'Upload your inventory to our platform. Our team handles professional photography and descriptions if needed.',
  },
  {
    step: '03',
    title: 'We Market & Sell',
    description: 'Your items appear to thousands of qualified buyers. We handle marketing, customer service, and secure payments.',
  },
  {
    step: '04',
    title: 'Get Paid Fast',
    description: 'Receive payouts within 48 hours of confirmed delivery. Track everything in your seller dashboard.',
  },
];

const testimonials = [
  {
    quote: "Joining Covet doubled our online sales in the first quarter. Their authentication process gives our customers confidence.",
    author: "Sarah M.",
    business: "Luxury Finds Boston",
  },
  {
    quote: "The platform is incredibly easy to use and their support team is always available. Best decision we made for our consignment business.",
    author: "Jennifer K.",
    business: "Estate Treasures NYC",
  },
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-brand-navy" />
            </div>
            <h1 className="font-heading text-2xl text-brand-navy mb-4">
              Become a Covet Seller
            </h1>
            <p className="font-mono text-sm text-gray-600 mb-8">
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
      <div className="min-h-screen bg-white">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            {existingApplication.status === 'APPROVED' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="font-heading text-2xl text-brand-navy mb-4">
                  Application Approved!
                </h1>
                <p className="font-mono text-sm text-gray-600 mb-8">
                  Your seller account is ready. Start managing your store.
                </p>
                <Link href="/store">
                  <Button size="lg">Go to Store Dashboard</Button>
                </Link>
              </>
            ) : existingApplication.status === 'REJECTED' ? (
              <>
                <h1 className="font-heading text-2xl text-brand-navy mb-4">
                  Application Not Approved
                </h1>
                <p className="font-mono text-sm text-gray-600 mb-4">
                  Unfortunately, your application was not approved at this time.
                </p>
                {existingApplication.reviewNotes && (
                  <Card className="p-4 mb-8 text-left">
                    <p className="font-mono text-sm text-gray-600">{existingApplication.reviewNotes}</p>
                  </Card>
                )}
                <Link href="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </>
            ) : existingApplication.status === 'NEEDS_INFO' ? (
              <>
                <h1 className="font-heading text-2xl text-brand-navy mb-4">
                  Additional Information Needed
                </h1>
                <p className="font-mono text-sm text-gray-600 mb-4">
                  We need more information to process your application.
                </p>
                {existingApplication.reviewNotes && (
                  <Card className="p-4 mb-8 text-left">
                    <p className="font-mono text-sm text-gray-600">{existingApplication.reviewNotes}</p>
                  </Card>
                )}
                <Link href="/contact">
                  <Button>Respond to Request</Button>
                </Link>
              </>
            ) : (
              <>
                <Spinner size="lg" className="mx-auto mb-6" />
                <h1 className="font-heading text-2xl text-brand-navy mb-4">
                  Application Under Review
                </h1>
                <p className="font-mono text-sm text-gray-600 mb-4">
                  Thank you for applying! We&apos;re reviewing your application and will
                  be in touch within 2-3 business days.
                </p>
                <Card className="p-4 text-left">
                  <h3 className="font-heading text-brand-navy mb-2">{existingApplication.businessName}</h3>
                  <p className="font-mono text-xs text-brand-muted">
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-brand-navy py-16 lg:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-300 mb-4">Partner with Covet</p>
            <h1 className="font-heading text-3xl lg:text-5xl text-white mb-6">
              Grow Your Consignment Business
            </h1>
            <p className="font-mono text-base text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Join the premier marketplace for authenticated luxury resale. Reach thousands of qualified buyers and let us handle the rest.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#apply" className="inline-block bg-white text-brand-navy font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
                Apply Now
              </a>
              <a href="#how-it-works" className="inline-block border border-white/30 text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
                Learn More
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Bar */}
      <div className="bg-brand-cream py-8 border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-heading text-3xl text-brand-navy">10k+</p>
              <p className="font-mono text-xs text-gray-600 uppercase tracking-wider">Active Buyers</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-brand-navy">85%</p>
              <p className="font-mono text-xs text-gray-600 uppercase tracking-wider">Sell-Through Rate</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-brand-navy">48hr</p>
              <p className="font-mono text-xs text-gray-600 uppercase tracking-wider">Payout Speed</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-brand-navy">6%</p>
              <p className="font-mono text-xs text-gray-600 uppercase tracking-wider">Commission Rate</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Why Partner Section */}
      <div className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl lg:text-3xl text-brand-navy mb-4">Why Shops Partner With Covet</h2>
            <p className="font-mono text-sm text-gray-600 max-w-2xl mx-auto">
              We help consignment stores and luxury resellers reach more customers, sell faster, and grow their business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {whyPartner.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-brand-navy/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-brand-navy" />
                </div>
                <h3 className="font-heading text-lg text-brand-navy mb-2">{item.title}</h3>
                <p className="font-mono text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Detailed Benefits */}
          <div className="border-t border-gray-200 pt-16">
            <h3 className="font-heading text-xl lg:text-2xl text-brand-navy mb-8 text-center">Everything You Need to Succeed</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {detailedBenefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 lg:p-8">
                  <h4 className="font-heading text-lg text-brand-navy mb-4">{benefit.title}</h4>
                  <ul className="space-y-3">
                    {benefit.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="font-mono text-sm text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl lg:text-3xl text-brand-navy mb-4">How It Works</h2>
            <p className="font-mono text-sm text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. We handle the hard parts so you can focus on finding great inventory.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-heading text-brand-navy/10 mb-4">{item.step}</div>
                <h3 className="font-heading text-lg text-brand-navy mb-2">{item.title}</h3>
                <p className="font-mono text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Testimonials */}
      <div className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl lg:text-3xl text-brand-navy mb-4">What Partners Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-brand-cream p-8 rounded-xl">
                <p className="font-mono text-sm text-gray-700 mb-6 italic">&ldquo;{item.quote}&rdquo;</p>
                <div>
                  <p className="font-heading text-brand-navy">{item.author}</p>
                  <p className="font-mono text-xs text-gray-500">{item.business}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Partner Benefits CTA */}
      <div className="py-16 lg:py-24 bg-brand-navy">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl lg:text-3xl text-white mb-4">Why Partner with Covet?</h2>
              <p className="font-mono text-gray-300 max-w-2xl mx-auto">
                Everything you need to grow your consignment business, all in one platform.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg text-white mb-2">Reach Thousands of Buyers</h3>
                <p className="font-mono text-sm text-gray-300">Access our growing community of luxury shoppers actively looking for authenticated pieces.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg text-white mb-2">Covet Authentication</h3>
                <p className="font-mono text-sm text-gray-300">Every item you list gets the Covet seal of authenticity, building instant buyer trust.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-lg text-white mb-2">Higher Margins</h3>
                <p className="font-mono text-sm text-gray-300">Our low commission rates mean you keep more of each sale. No hidden fees.</p>
              </div>
            </div>

            {/* Benefits Checklist Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10">
              <h3 className="font-heading text-xl text-white mb-6 text-center">Want to sell on Covet?</h3>
              <p className="font-mono text-sm text-gray-300 mb-8 text-center max-w-xl mx-auto">
                Join our network of trusted luxury consignment partners and reach thousands of authenticated buyers.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                {[
                  'No upfront costs or monthly fees',
                  'Professional product photography',
                  'Expert authentication services',
                  'Marketing & promotion included',
                  'Fast payouts within 48 hours',
                  'Dedicated partner support team',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href="#apply"
                  className="inline-flex items-center gap-2 bg-white text-brand-navy font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Become a Partner
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Application Section */}
      <div id="apply" className="py-16 lg:py-24 bg-gray-50">
        <Container>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-cream p-6 sticky top-24">
              <h2 className="font-heading text-lg text-brand-navy mb-4">Why Sell on Covet?</h2>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 font-mono text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <hr className="my-6 border-gray-200" />

              <div className="font-mono text-sm">
                <p className="font-heading text-brand-navy mb-2">Commission Structure</p>
                <p className="mb-2">
                  <span className="text-2xl font-heading text-brand-navy">6%</span>
                  <span className="text-gray-500"> platform fee</span>
                </p>
                <p className="text-xs text-brand-muted">Plus $199/month subscription for partner stores</p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-6 lg:p-8">
              {/* Progress Indicator */}
              <StepIndicator steps={applicationSteps} currentStep={step} />

              <form onSubmit={handleSubmit}>
                {/* Step 1: Business Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading text-xl text-brand-navy mb-2">Business Information</h2>
                      <p className="font-mono text-sm text-brand-muted">Tell us about your business</p>
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
                      <h2 className="font-heading text-xl text-brand-navy mb-2">Inventory & Categories</h2>
                      <p className="font-mono text-sm text-brand-muted">What do you sell?</p>
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
                            className={`p-3 border text-sm text-left transition-colors ${
                              formData.categories.includes(cat.value)
                                ? 'border-brand-navy bg-brand-cream text-brand-navy'
                                : 'border-gray-200 hover:border-brand-navy'
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
                      <h2 className="font-heading text-xl text-brand-navy mb-2">Contact Information</h2>
                      <p className="font-mono text-sm text-brand-muted">How can we reach you?</p>
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
            </div>
          </div>
        </div>
        </Container>
      </div>
    </div>
  );
}
