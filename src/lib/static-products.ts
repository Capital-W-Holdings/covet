// Static product data for consistent rendering across serverless instances
// This replaces the in-memory database for product display

export interface StaticProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  condition: string;
  priceCents: number;
  originalPriceCents: number;
  image: string;
  description: string;
}

export const staticProducts: StaticProduct[] = [
  {
    id: 'prod_1',
    sku: 'hermes-birkin-25-noir',
    title: 'Hermès Birkin 25 Togo Noir',
    brand: 'Hermès',
    category: 'HANDBAGS',
    condition: 'EXCELLENT',
    priceCents: 1895000,
    originalPriceCents: 2200000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware.',
  },
  {
    id: 'prod_2',
    sku: 'chanel-classic-flap-medium',
    title: 'Chanel Classic Flap Medium Caviar',
    brand: 'Chanel',
    category: 'HANDBAGS',
    condition: 'VERY_GOOD',
    priceCents: 785000,
    originalPriceCents: 1050000,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    description: 'Timeless Chanel Classic Medium Flap in black caviar leather with silver hardware.',
  },
  {
    id: 'prod_3',
    sku: 'rolex-datejust-36',
    title: 'Rolex Datejust 36 Two-Tone',
    brand: 'Rolex',
    category: 'WATCHES',
    condition: 'EXCELLENT',
    priceCents: 895000,
    originalPriceCents: 1200000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
    description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold with champagne dial.',
  },
  {
    id: 'prod_4',
    sku: 'cartier-love-bracelet',
    title: 'Cartier Love Bracelet Yellow Gold',
    brand: 'Cartier',
    category: 'JEWELRY',
    condition: 'EXCELLENT',
    priceCents: 595000,
    originalPriceCents: 750000,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
    description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17.',
  },
  {
    id: 'prod_5',
    sku: 'louis-vuitton-neverfull-mm',
    title: 'Louis Vuitton Neverfull MM Damier Ebene',
    brand: 'Louis Vuitton',
    category: 'HANDBAGS',
    condition: 'VERY_GOOD',
    priceCents: 145000,
    originalPriceCents: 200000,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
    description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas with red interior.',
  },
  {
    id: 'prod_6',
    sku: 'gucci-marmont-small',
    title: 'Gucci GG Marmont Small Matelassé',
    brand: 'Gucci',
    category: 'HANDBAGS',
    condition: 'EXCELLENT',
    priceCents: 165000,
    originalPriceCents: 250000,
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink matelassé leather.',
  },
  {
    id: 'prod_7',
    sku: 'omega-speedmaster-moonwatch',
    title: 'Omega Speedmaster Professional Moonwatch',
    brand: 'Omega',
    category: 'WATCHES',
    condition: 'EXCELLENT',
    priceCents: 495000,
    originalPriceCents: 650000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
    description: 'The legendary Omega Speedmaster Professional "Moonwatch" with hesalite crystal.',
  },
  {
    id: 'prod_8',
    sku: 'van-cleef-alhambra-vintage',
    title: 'Van Cleef & Arpels Vintage Alhambra Pendant',
    brand: 'Van Cleef & Arpels',
    category: 'JEWELRY',
    condition: 'EXCELLENT',
    priceCents: 325000,
    originalPriceCents: 420000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    description: 'Signature Van Cleef & Arpels Vintage Alhambra pendant in 18k yellow gold.',
  },
  {
    id: 'prod_9',
    sku: 'dior-lady-dior-medium',
    title: 'Dior Lady Dior Medium',
    brand: 'Dior',
    category: 'HANDBAGS',
    condition: 'EXCELLENT',
    priceCents: 425000,
    originalPriceCents: 550000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    description: 'Classic Lady Dior medium in black lambskin with silver hardware.',
  },
  {
    id: 'prod_10',
    sku: 'patek-philippe-nautilus',
    title: 'Patek Philippe Nautilus 5711',
    brand: 'Patek Philippe',
    category: 'WATCHES',
    condition: 'EXCELLENT',
    priceCents: 12500000,
    originalPriceCents: 15000000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
    description: 'Iconic Patek Philippe Nautilus 5711/1A in stainless steel with blue dial.',
  },
  {
    id: 'prod_11',
    sku: 'tiffany-diamond-pendant',
    title: 'Tiffany & Co. Diamond Pendant',
    brand: 'Tiffany & Co.',
    category: 'JEWELRY',
    condition: 'NEW_WITH_TAGS',
    priceCents: 285000,
    originalPriceCents: 350000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    description: 'Elegant Tiffany diamond solitaire pendant in platinum.',
  },
  {
    id: 'prod_12',
    sku: 'prada-galleria-saffiano',
    title: 'Prada Galleria Saffiano Medium',
    brand: 'Prada',
    category: 'HANDBAGS',
    condition: 'VERY_GOOD',
    priceCents: 195000,
    originalPriceCents: 295000,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    description: 'Timeless Prada Galleria in black saffiano leather.',
  },
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export const conditionLabels: Record<string, string> = {
  NEW_WITH_TAGS: 'New with Tags',
  NEW_WITHOUT_TAGS: 'New',
  EXCELLENT: 'Excellent',
  VERY_GOOD: 'Very Good',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export const categoryLabels: Record<string, string> = {
  HANDBAGS: 'Handbags',
  WATCHES: 'Watches',
  JEWELRY: 'Jewelry',
  ACCESSORIES: 'Accessories',
  CLOTHING: 'Clothing',
  SHOES: 'Shoes',
};
