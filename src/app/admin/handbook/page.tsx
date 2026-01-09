'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Package,
  ShoppingCart,
  MessageCircle,
  Shield,
  TrendingUp,
  Settings,
  Store,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Heart,
} from 'lucide-react';
import { Container, Card, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function CollapsibleSection({ section, isOpen, onToggle }: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            {section.icon}
          </div>
          <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {section.content}
        </div>
      )}
    </Card>
  );
}

export default function OwnerHandbookPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['welcome']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== 'COVET_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login?redirect=/admin/handbook');
    return null;
  }

  const sections: Section[] = [
    {
      id: 'welcome',
      title: 'Welcome, Hanadi!',
      icon: <Heart className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Hey Hanadi! Jesse here. I&apos;ve put together this handbook specifically for you to help you get the most out of your Covet admin dashboard. This platform has been built with your business in mind, and I want to make sure you feel confident managing every aspect of it.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Think of this as your go-to reference guide. Whenever you&apos;re unsure about something, come back here. I&apos;ve organized everything into sections so you can quickly find what you need.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm font-medium mb-1">Quick Tip</p>
            <p className="text-amber-700 text-sm">
              Bookmark this page! You can access it anytime from the Admin Dashboard under &quot;Owner Handbook&quot; in Quick Actions.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Understanding Your Dashboard',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Your Admin Dashboard is your command center. Here&apos;s what each metric means:
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-sm">$</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Revenue</p>
                <p className="text-sm text-gray-600">All sales processed through your platform. This is before any fees or payouts.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Orders</p>
                <p className="text-sm text-gray-600">Complete count of all orders, regardless of status.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pending Orders</p>
                <p className="text-sm text-gray-600">Orders that need attention - either awaiting payment confirmation or shipment.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Products</p>
                <p className="text-sm text-gray-600">Active listings in your inventory. Sold items are not included.</p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'products',
      title: 'Managing Products',
      icon: <Package className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <h3 className="text-base font-medium text-gray-900 mb-3">Adding New Products</h3>
          <ol className="space-y-2 text-gray-600">
            <li>1. Click <strong>&quot;Add Product&quot;</strong> from the dashboard or go to Manage Products</li>
            <li>2. Upload high-quality photos (8 max) - first photo is the main image</li>
            <li>3. Fill in all details: title, brand, category, condition</li>
            <li>4. Set your price and original retail price (shows savings to customers)</li>
            <li>5. Choose to &quot;Save as Draft&quot; or &quot;Publish&quot; immediately</li>
          </ol>

          <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Product Statuses</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">DRAFT</span>
              <span className="text-sm text-gray-600">Not visible to customers yet</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">ACTIVE</span>
              <span className="text-sm text-gray-600">Live and available for purchase</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">SOLD</span>
              <span className="text-sm text-gray-600">Successfully purchased</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">RESERVED</span>
              <span className="text-sm text-gray-600">Held in someone&apos;s cart (15 min)</span>
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm font-medium mb-1">Pro Tip from Jesse</p>
            <p className="text-blue-700 text-sm">
              Great photos sell items! Use natural lighting, show all angles, and capture any imperfections honestly. Customers appreciate transparency and it reduces returns.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'orders',
      title: 'Processing Orders',
      icon: <ShoppingCart className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <h3 className="text-base font-medium text-gray-900 mb-3">Order Lifecycle</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Pending</p>
                <p className="text-sm text-gray-600">Payment is being processed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirmed</p>
                <p className="text-sm text-gray-600">Payment received - time to pack!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipped</p>
                <p className="text-sm text-gray-600">Add tracking number when you ship</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivered</p>
                <p className="text-sm text-gray-600">Customer has received the item</p>
              </div>
            </div>
          </div>

          <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Shipping Best Practices</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>• Ship within 2 business days of confirmed payment</li>
            <li>• Always use tracked, insured shipping for luxury items</li>
            <li>• Double-box high-value items for extra protection</li>
            <li>• Include a thank-you note - personal touches matter!</li>
            <li>• Update tracking immediately so customers can follow their purchase</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'support',
      title: 'Handling Support Tickets',
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Great customer service is what sets Covet apart. Here&apos;s how to handle support tickets like a pro:
          </p>

          <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">Response Time Goals</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong className="text-red-600">Urgent:</strong> Within 2 hours during business hours</li>
            <li>• <strong className="text-amber-600">High:</strong> Within 4 hours</li>
            <li>• <strong>Medium:</strong> Within 24 hours</li>
            <li>• <strong className="text-gray-500">Low:</strong> Within 48 hours</li>
          </ul>

          <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Common Issues & How to Handle</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-1">&quot;Where is my order?&quot;</p>
              <p className="text-sm text-gray-600">Check tracking, provide status update. If delayed, apologize and offer estimated delivery.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-1">&quot;Item not as described&quot;</p>
              <p className="text-sm text-gray-600">Ask for photos, compare to listing. If valid, offer return/refund. If unclear, escalate to me.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-1">&quot;Authentication concern&quot;</p>
              <p className="text-sm text-gray-600">Take seriously! Request specific concerns and photos. We stand behind our authentication 100%.</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-green-800 text-sm font-medium mb-1">Hanadi&apos;s Superpower</p>
            <p className="text-green-700 text-sm">
              Your personal touch and expertise in luxury goods is your biggest asset. Don&apos;t be afraid to hop on a call with VIP customers - they&apos;ll remember that forever.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sellers',
      title: 'Managing Seller Applications',
      icon: <Store className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            As you grow, you might want to bring on trusted partner sellers. Here&apos;s what to look for:
          </p>

          <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">Green Flags</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              Established business with verifiable history
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              Professional photos and descriptions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              Existing authentication processes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              Specialization in brands you trust
            </li>
          </ul>

          <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Red Flags</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              Prices too good to be true
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              Stock photos instead of actual item photos
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              Vague or inconsistent business information
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              Pressure to approve quickly
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'disputes',
      title: 'Resolving Disputes',
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Disputes happen, but how you handle them defines your brand. Here&apos;s my approach:
          </p>

          <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">The HEAR Method</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">H</span>
              <div>
                <p className="font-medium text-gray-900">Hear them out</p>
                <p className="text-sm text-gray-600">Let the customer explain fully without interruption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">E</span>
              <div>
                <p className="font-medium text-gray-900">Empathize</p>
                <p className="text-sm text-gray-600">Acknowledge their frustration - it&apos;s valid</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">A</span>
              <div>
                <p className="font-medium text-gray-900">Act quickly</p>
                <p className="text-sm text-gray-600">Propose a solution within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">R</span>
              <div>
                <p className="font-medium text-gray-900">Resolve & Review</p>
                <p className="text-sm text-gray-600">Fix the issue, then review what caused it</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm font-medium mb-1">When in Doubt</p>
            <p className="text-amber-700 text-sm">
              Err on the side of the customer for first-time issues. A $200 refund that keeps a customer for life is worth far more than &quot;winning&quot; a dispute.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'authentication',
      title: 'Authentication Standards',
      icon: <Shield className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Authentication is the backbone of Covet. Every item carrying our &quot;Covet Certified&quot; badge represents a promise to our customers.
          </p>

          <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">What We Check</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Materials:</strong> Leather quality, hardware weight, stitching</li>
            <li>• <strong>Date codes/Serial numbers:</strong> Format matches brand standards</li>
            <li>• <strong>Hardware:</strong> Engravings, finish, weight</li>
            <li>• <strong>Fonts & Logos:</strong> Spacing, depth, alignment</li>
            <li>• <strong>Packaging:</strong> Dust bags, boxes, authenticity cards</li>
            <li>• <strong>Provenance:</strong> Original receipts, purchase history when available</li>
          </ul>

          <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Brand-Specific Notes</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Hermès:</strong> Blindstamp location, sangles, date stamps</p>
            <p><strong>Chanel:</strong> Serial sticker hologram, CC alignment, chain weight</p>
            <p><strong>Louis Vuitton:</strong> Date codes, canvas alignment, trim patina</p>
            <p><strong>Rolex:</strong> Movement inspection, serial placement, rehaut engraving</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800 text-sm font-medium mb-1">Zero Tolerance</p>
            <p className="text-red-700 text-sm">
              If there&apos;s ANY doubt about authenticity, we don&apos;t list it. Our reputation is everything. When you reject an item, document why for future reference.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Need Help? Contact Jesse',
      icon: <Users className="w-5 h-5 text-white" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            Hanadi, I&apos;m always here to help. Don&apos;t hesitate to reach out if you need anything - whether it&apos;s a technical issue, a tricky customer situation, or just want to brainstorm ideas.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mt-4">
            <h3 className="text-base font-medium text-gray-900 mb-4">Ways to Reach Me</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">For urgent issues</p>
                <p className="font-medium text-gray-900">Text or call anytime</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">For non-urgent questions</p>
                <p className="font-medium text-gray-900">Email works great</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">For feature requests or ideas</p>
                <p className="font-medium text-gray-900">Let&apos;s schedule a quick call!</p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-lg p-6 mt-4">
            <p className="font-medium mb-2">You&apos;ve got this, Hanadi!</p>
            <p className="text-sm text-gray-300">
              I built this platform because I believe in what you&apos;re doing with Covet. Your expertise in luxury goods combined with this technology is going to create something special. Excited to see it grow!
            </p>
            <p className="text-sm text-gray-400 mt-4">- Jesse</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-light text-gray-900">Owner Handbook</h1>
            <p className="text-gray-500">Your guide to running Covet like a pro</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>

        <Card className="p-6 mt-8 bg-gradient-to-r from-gray-900 to-black text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium">Built with care for Covet</p>
              <p className="text-sm text-gray-300">
                This handbook will be updated as we add new features. Last updated: January 2026
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
