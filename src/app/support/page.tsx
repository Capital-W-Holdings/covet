'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageCircle,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  User,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Container, Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    name: 'Orders & Shipping',
    icon: <Package className="w-5 h-5" />,
    items: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available at checkout for an additional fee. All items are shipped with full insurance and tracking.',
      },
      {
        question: 'How do I track my order?',
        answer: 'Once your order ships, you\'ll receive an email with your tracking number. You can also view tracking information in your Account > Orders section.',
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team immediately. Once an item has shipped, it cannot be cancelled.',
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Pricing',
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay. All transactions are secured with SSL encryption.',
      },
      {
        question: 'When will I be charged?',
        answer: 'Your payment method is charged immediately upon order confirmation. For high-value items, we may place a temporary authorization hold.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use Stripe for payment processing and never store your full credit card details on our servers. All transactions are PCI-DSS compliant.',
      },
    ],
  },
  {
    id: 'returns',
    name: 'Returns & Refunds',
    icon: <RotateCcw className="w-5 h-5" />,
    items: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 14-day return window from delivery date for items in original condition. Items must be unworn, with all original tags and packaging. Some exclusions apply for hygiene-sensitive items.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Go to Account > Orders, select the order, and click "Request Return." You\'ll receive a prepaid shipping label and instructions. Refunds are processed within 5-7 business days after we receive the item.',
      },
      {
        question: 'What if my item arrives damaged?',
        answer: 'Contact us immediately with photos of the damage. We\'ll arrange a free return and full refund, or send a replacement if available.',
      },
    ],
  },
  {
    id: 'authentication',
    name: 'Authentication',
    icon: <Shield className="w-5 h-5" />,
    items: [
      {
        question: 'How do you authenticate items?',
        answer: 'Every item undergoes our rigorous Covet Certified authentication process. Our expert team examines materials, hardware, stitching, date codes, and provenance. We also use technology partners for additional verification on select brands.',
      },
      {
        question: 'What does "Covet Certified" mean?',
        answer: 'Covet Certified items have been authenticated by our in-house experts and come with our authenticity guarantee. If an item is later proven to be inauthentic, we provide a full refund.',
      },
      {
        question: 'Can I get a certificate of authenticity?',
        answer: 'Yes! All Covet Certified items come with a digital certificate of authenticity that you can access in your account. Physical certificates are available upon request.',
      },
    ],
  },
  {
    id: 'selling',
    name: 'Selling with Covet',
    icon: <Truck className="w-5 h-5" />,
    items: [
      {
        question: 'How do I become a seller?',
        answer: 'Click "Sell With Us" and complete our seller application. We review applications within 2-3 business days. Once approved, you can list items through your Seller Dashboard.',
      },
      {
        question: 'What are the seller fees?',
        answer: 'Our commission rates vary by item value and seller tier. Standard sellers pay 15-20%, while Premium sellers enjoy reduced rates of 10-15%. There are no listing fees.',
      },
      {
        question: 'How and when do I get paid?',
        answer: 'Payments are processed 3 days after the buyer\'s return window closes. Funds are deposited directly to your connected bank account via Stripe.',
      },
    ],
  },
  {
    id: 'account',
    name: 'Account & Security',
    icon: <User className="w-5 h-5" />,
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a link to create a new password. Links expire after 24 hours.',
      },
      {
        question: 'How do I update my shipping address?',
        answer: 'Go to Account > Settings > Shipping Addresses. You can add, edit, or remove addresses. Make sure to set your preferred address as default.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team to request account deletion. Please note that active orders must be completed first, and deletion is permanent.',
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-gray-900">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 text-sm leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('orders');

  const currentCategory = faqCategories.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
            How can we help?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/support/contact">
            <Card hover className="p-6 text-center h-full">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-500">
                Submit a ticket and get help from our team
              </p>
            </Card>
          </Link>

          {user && (
            <Link href="/support/tickets">
              <Card hover className="p-6 text-center h-full">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">My Tickets</h3>
                <p className="text-sm text-gray-500">
                  View and manage your support requests
                </p>
              </Card>
            </Link>
          )}

          <Link href="/account/orders">
            <Card hover className="p-6 text-center h-full">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Track Order</h3>
              <p className="text-sm text-gray-500">
                Check the status of your orders
              </p>
            </Card>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="font-medium text-gray-900 mb-4">Topics</h2>
            <nav className="space-y-1">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                {currentCategory?.name}
              </h2>
              <div className="divide-y divide-gray-100">
                {currentCategory?.items.map((item, index) => (
                  <FAQAccordion key={index} item={item} />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <Card className="p-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">
            Still need help?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email Us</h3>
              <a
                href="mailto:support@covet.com"
                className="text-sm text-gray-600 hover:text-black"
              >
                support@covet.com
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Call Us</h3>
              <a
                href="tel:+16175550100"
                className="text-sm text-gray-600 hover:text-black"
              >
                (617) 555-0100
              </a>
              <p className="text-xs text-gray-400 mt-1">Mon-Fri, 9am-6pm EST</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Visit Us</h3>
              <p className="text-sm text-gray-600">
                234 Newbury Street<br />
                Boston, MA 02116
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
