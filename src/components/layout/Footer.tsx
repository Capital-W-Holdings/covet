import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui';

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/shop' },
    { name: 'Handbags', href: '/shop?category=HANDBAGS' },
    { name: 'Watches', href: '/shop?category=WATCHES' },
    { name: 'Jewelry', href: '/shop?category=JEWELRY' },
    { name: 'New Arrivals', href: '/shop?sort=createdAt&order=desc' },
  ],
  about: [
    { name: 'Our Story', href: '/about' },
    { name: 'Authentication', href: '/authentication' },
    { name: 'Consign With Us', href: '/consign' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp"
                alt="Covet"
                width={100}
                height={28}
                className="h-6 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Boston&apos;s premier destination for authenticated luxury consignment.
            </p>
            <p className="text-gray-400 text-sm">
              234 Newbury Street<br />
              Boston, MA 02116
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Covet. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
