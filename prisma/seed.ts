import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.authentication.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storePayout.deleteMany();
  await prisma.storeApplication.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing data');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      id: 'user_admin',
      email: 'admin@covet.com',
      passwordHash: adminPasswordHash,
      role: 'COVET_ADMIN',
      status: 'ACTIVE',
      profileName: 'Covet Admin',
    },
  });
  console.log('✓ Created admin user:', adminUser.email);

  // Create store admin
  const storePasswordHash = await bcrypt.hash('Store123!', 10);
  const storeUser = await prisma.user.create({
    data: {
      id: 'user_store',
      email: 'store@covet.com',
      passwordHash: storePasswordHash,
      role: 'STORE_ADMIN',
      status: 'ACTIVE',
      profileName: 'Store Manager',
    },
  });
  console.log('✓ Created store admin:', storeUser.email);

  // Create test buyer
  const buyerPasswordHash = await bcrypt.hash('Buyer123!', 10);
  const buyerUser = await prisma.user.create({
    data: {
      id: 'user_buyer',
      email: 'buyer@test.com',
      passwordHash: buyerPasswordHash,
      role: 'BUYER',
      status: 'ACTIVE',
      profileName: 'Test Buyer',
    },
  });
  console.log('✓ Created buyer:', buyerUser.email);

  // Create buyer address
  await prisma.address.create({
    data: {
      userId: buyerUser.id,
      name: 'Test Buyer',
      street1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: 'US',
      isDefault: true,
    },
  });

  // Create Covet flagship store
  const covetStore = await prisma.store.create({
    data: {
      id: 'store_covet',
      slug: 'covet-boston',
      name: 'Covet Boston',
      ownerId: adminUser.id,
      type: 'COVET_FLAGSHIP',
      tier: 'FLAGSHIP',
      status: 'ACTIVE',
      brandingLogoUrl: 'https://i.ibb.co/99Gyjq1p/Covet-Logotype.webp',
      brandingAccentColor: '#1a1a1a',
      brandingDescription: "Boston's premier destination for authenticated luxury consignment. Since 2015, we've connected discerning buyers with the world's finest pre-owned luxury goods.",
      brandingTagline: 'Luxury, Authenticated.',
      contactEmail: 'hello@covet.com',
      contactPhone: '(617) 555-0100',
      contactStreet1: '234 Newbury Street',
      contactCity: 'Boston',
      contactState: 'MA',
      contactPostalCode: '02116',
      contactCountry: 'US',
      trustScore: 98,
      takeRate: 0.06,
    },
  });
  console.log('✓ Created store:', covetStore.name);

  // Create sample products
  const products = [
    {
      storeId: covetStore.id,
      sku: 'hermes-birkin-25-noir',
      title: 'Hermès Birkin 25 Togo Noir',
      description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware. Includes original box, dustbag, lock, keys, and clochette. Date stamp T (2015).',
      brand: 'Hermès',
      category: 'HANDBAGS' as const,
      subcategory: 'Totes',
      condition: 'EXCELLENT' as const,
      priceCents: 1895000,
      originalPriceCents: 2200000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', alt: 'Hermès Birkin 25 Front', order: 0, isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', alt: 'Hermès Birkin 25 Side', order: 1 },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Togo Leather',
        color: 'Noir (Black)',
        serialNumber: 'T****25',
        yearProduced: 2015,
        measurements: { width: 25, height: 19, depth: 13, unit: 'cm' },
        includedAccessories: ['Original Box', 'Dustbag', 'Lock', 'Keys', 'Clochette'],
      }),
      viewCount: 342,
    },
    {
      storeId: covetStore.id,
      sku: 'chanel-classic-flap-medium',
      title: 'Chanel Classic Flap Medium Caviar',
      description: 'Timeless Chanel Classic Medium Flap in black caviar leather with silver hardware. Excellent condition with minor wear to corners.',
      brand: 'Chanel',
      category: 'HANDBAGS' as const,
      subcategory: 'Shoulder Bags',
      condition: 'VERY_GOOD' as const,
      priceCents: 785000,
      originalPriceCents: 1050000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', alt: 'Chanel Classic Flap', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Caviar Leather',
        color: 'Black',
        serialNumber: '25******',
        yearProduced: 2019,
        measurements: { width: 25.5, height: 15.5, depth: 6.5, unit: 'cm' },
        includedAccessories: ['Dustbag', 'Authenticity Card'],
      }),
      viewCount: 528,
    },
    {
      storeId: covetStore.id,
      sku: 'rolex-datejust-36',
      title: 'Rolex Datejust 36 Two-Tone',
      description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold with champagne dial. Includes box, papers, and service history.',
      brand: 'Rolex',
      category: 'WATCHES' as const,
      subcategory: 'Dress Watches',
      condition: 'EXCELLENT' as const,
      priceCents: 895000,
      originalPriceCents: 1200000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', alt: 'Rolex Datejust', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Steel/18k Yellow Gold',
        color: 'Champagne',
        serialNumber: '****7890',
        yearProduced: 2018,
        includedAccessories: ['Box', 'Papers', 'Service Records'],
      }),
      viewCount: 892,
    },
    {
      storeId: covetStore.id,
      sku: 'cartier-love-bracelet',
      title: 'Cartier Love Bracelet Yellow Gold',
      description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17. Includes original screwdriver, box, and certificate.',
      brand: 'Cartier',
      category: 'JEWELRY' as const,
      subcategory: 'Bracelets',
      condition: 'EXCELLENT' as const,
      priceCents: 595000,
      originalPriceCents: 750000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800', alt: 'Cartier Love Bracelet', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: '18k Yellow Gold',
        color: 'Yellow Gold',
        size: '17',
        includedAccessories: ['Screwdriver', 'Box', 'Certificate'],
      }),
      viewCount: 456,
    },
    {
      storeId: covetStore.id,
      sku: 'louis-vuitton-neverfull-mm',
      title: 'Louis Vuitton Neverfull MM Damier Ebene',
      description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas with red interior. Includes pochette.',
      brand: 'Louis Vuitton',
      category: 'HANDBAGS' as const,
      subcategory: 'Totes',
      condition: 'VERY_GOOD' as const,
      priceCents: 145000,
      originalPriceCents: 200000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', alt: 'LV Neverfull', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Damier Ebene Canvas',
        color: 'Brown',
        measurements: { width: 32, height: 28.5, depth: 17, unit: 'cm' },
        includedAccessories: ['Pochette'],
      }),
      viewCount: 723,
    },
    {
      storeId: covetStore.id,
      sku: 'gucci-marmont-small',
      title: 'Gucci GG Marmont Small Matelassé',
      description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink matelassé leather with gold hardware.',
      brand: 'Gucci',
      category: 'HANDBAGS' as const,
      subcategory: 'Shoulder Bags',
      condition: 'EXCELLENT' as const,
      priceCents: 165000,
      originalPriceCents: 250000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', alt: 'Gucci Marmont', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Matelassé Leather',
        color: 'Dusty Pink',
        measurements: { width: 26, height: 15, depth: 7, unit: 'cm' },
        includedAccessories: ['Dustbag'],
      }),
      viewCount: 234,
    },
    {
      storeId: covetStore.id,
      sku: 'omega-speedmaster-moonwatch',
      title: 'Omega Speedmaster Professional Moonwatch',
      description: 'The legendary Omega Speedmaster Professional "Moonwatch" with hesalite crystal. Manual wind caliber 1861.',
      brand: 'Omega',
      category: 'WATCHES' as const,
      subcategory: 'Chronographs',
      condition: 'EXCELLENT' as const,
      priceCents: 495000,
      originalPriceCents: 650000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', alt: 'Omega Speedmaster', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: 'Stainless Steel',
        color: 'Black',
        yearProduced: 2020,
        includedAccessories: ['Box', 'Papers', 'NATO Strap'],
      }),
      viewCount: 567,
    },
    {
      storeId: covetStore.id,
      sku: 'van-cleef-alhambra-vintage',
      title: 'Van Cleef & Arpels Vintage Alhambra Pendant',
      description: 'Signature Van Cleef & Arpels Vintage Alhambra pendant in 18k yellow gold with mother of pearl.',
      brand: 'Van Cleef & Arpels',
      category: 'JEWELRY' as const,
      subcategory: 'Necklaces',
      condition: 'EXCELLENT' as const,
      priceCents: 325000,
      originalPriceCents: 420000,
      images: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', alt: 'VCA Alhambra', order: 0, isPrimary: true },
      ]),
      authenticationStatus: 'COVET_CERTIFIED' as const,
      status: 'ACTIVE' as const,
      metadata: JSON.stringify({
        material: '18k Yellow Gold',
        color: 'Mother of Pearl',
        includedAccessories: ['Box', 'Certificate'],
      }),
      viewCount: 312,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✓ Created ${products.length} products`);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Test accounts:');
  console.log('  Admin: admin@covet.com / Admin123!');
  console.log('  Store: store@covet.com / Store123!');
  console.log('  Buyer: buyer@test.com / Buyer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
