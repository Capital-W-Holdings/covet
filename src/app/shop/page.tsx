'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

// Store locations
const stores = {
  backBay: { name: 'Back Bay', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  southEnd: { name: 'South End', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  beaconHill: { name: 'Beacon Hill', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  southie: { name: 'Southie', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  nyc: { name: 'NYC', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
  hamptons: { name: 'Hamptons', logo: 'https://i.ibb.co/xSWg62rN/Covet-Logotype.webp' },
};

// Static product data - comprehensive inventory
const allProducts = [
  // ============ DRESSES ============
  { id: 'd1', sku: 'chanel-tweed-dress-black', title: 'Chanel Tweed Sheath Dress', brand: 'Chanel', category: 'DRESSES', condition: 'Excellent', priceCents: 385000, originalPriceCents: 550000, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop', description: 'Classic Chanel black tweed sheath dress with gold button details. Size 38.', store: stores.backBay },
  { id: 'd2', sku: 'oscar-de-la-renta-gown', title: 'Oscar de la Renta Evening Gown', brand: 'Oscar de la Renta', category: 'DRESSES', condition: 'Excellent', priceCents: 295000, originalPriceCents: 450000, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=600&fit=crop', description: 'Stunning floor-length gown in midnight blue silk with beaded bodice.', store: stores.hamptons },
  { id: 'd3', sku: 'diane-von-furstenberg-wrap', title: 'DVF Iconic Wrap Dress', brand: 'Diane von Furstenberg', category: 'DRESSES', condition: 'Very Good', priceCents: 28500, originalPriceCents: 45000, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop', description: 'Classic DVF wrap dress in bold geometric print. Perfect for work or events.', store: stores.southEnd },
  { id: 'd4', sku: 'valentino-red-cocktail', title: 'Valentino Red Cocktail Dress', brand: 'Valentino', category: 'DRESSES', condition: 'Excellent', priceCents: 185000, originalPriceCents: 280000, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop', description: 'Valentino signature red cocktail dress with bow detail. Size 40.', store: stores.nyc },
  { id: 'd5', sku: 'reformation-midi-dress', title: 'Reformation Silk Midi Dress', brand: 'Reformation', category: 'DRESSES', condition: 'New', priceCents: 18500, originalPriceCents: 28000, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop', description: 'Sustainable silk midi dress in emerald green. Never worn with tags.', store: stores.beaconHill },
  { id: 'd6', sku: 'alexander-mcqueen-lbd', title: 'Alexander McQueen Sculpted LBD', brand: 'Alexander McQueen', category: 'DRESSES', condition: 'Excellent', priceCents: 145000, originalPriceCents: 220000, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=600&fit=crop', description: 'Architectural little black dress with signature McQueen tailoring.', store: stores.southie },

  // ============ TOPS & BLOUSES ============
  { id: 't1', sku: 'gucci-silk-blouse-floral', title: 'Gucci Silk Floral Blouse', brand: 'Gucci', category: 'TOPS', condition: 'Excellent', priceCents: 89500, originalPriceCents: 145000, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=600&fit=crop', description: 'Romantic Gucci silk blouse with vintage floral print and pussy bow.', store: stores.backBay },
  { id: 't2', sku: 'saint-laurent-silk-cami', title: 'Saint Laurent Silk Camisole', brand: 'Saint Laurent', category: 'TOPS', condition: 'Excellent', priceCents: 45000, originalPriceCents: 75000, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=600&fit=crop', description: 'Elegant black silk camisole with delicate lace trim.', store: stores.nyc },
  { id: 't3', sku: 'zimmermann-linen-blouse', title: 'Zimmermann Linen Peasant Blouse', brand: 'Zimmermann', category: 'TOPS', condition: 'Very Good', priceCents: 28500, originalPriceCents: 45000, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=600&fit=crop', description: 'Romantic ivory linen blouse with embroidered details.', store: stores.hamptons },
  { id: 't4', sku: 'celine-cashmere-sweater', title: 'Celine Cashmere Crewneck', brand: 'Celine', category: 'TOPS', condition: 'Excellent', priceCents: 75000, originalPriceCents: 120000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', description: 'Luxurious cream cashmere crewneck with subtle logo embroidery.', store: stores.beaconHill },
  { id: 't5', sku: 'equipment-silk-shirt', title: 'Equipment Signature Silk Shirt', brand: 'Equipment', category: 'TOPS', condition: 'Very Good', priceCents: 12500, originalPriceCents: 22000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', description: 'Classic Equipment button-down in washed silk. Wardrobe essential.', store: stores.southEnd },

  // ============ COATS & JACKETS (OUTERWEAR) ============
  { id: 'o1', sku: 'burberry-trench-heritage', title: 'Burberry Heritage Trench Coat', brand: 'Burberry', category: 'OUTERWEAR', condition: 'Excellent', priceCents: 145000, originalPriceCents: 220000, image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop', description: 'Iconic Burberry trench in honey color with signature check lining.', store: stores.backBay },
  { id: 'o2', sku: 'max-mara-camel-coat', title: 'Max Mara Camel Hair Coat', brand: 'Max Mara', category: 'OUTERWEAR', condition: 'Excellent', priceCents: 185000, originalPriceCents: 280000, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop', description: 'Timeless Max Mara 101801 Icon coat in pure camel hair.', store: stores.nyc },
  { id: 'o3', sku: 'chanel-tweed-jacket', title: 'Chanel Classic Tweed Jacket', brand: 'Chanel', category: 'OUTERWEAR', condition: 'Excellent', priceCents: 495000, originalPriceCents: 680000, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop', description: 'Iconic Chanel bouclé jacket in pink and cream with gold buttons.', store: stores.hamptons },
  { id: 'o4', sku: 'moncler-puffer-black', title: 'Moncler Maya Puffer Jacket', brand: 'Moncler', category: 'OUTERWEAR', condition: 'Very Good', priceCents: 89500, originalPriceCents: 145000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop', description: 'Classic Moncler down puffer in matte black. Size 2.', store: stores.beaconHill },
  { id: 'o5', sku: 'acne-leather-jacket', title: 'Acne Studios Leather Biker', brand: 'Acne Studios', category: 'OUTERWEAR', condition: 'Very Good', priceCents: 95000, originalPriceCents: 150000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop', description: 'Buttery soft lamb leather moto jacket in classic black.', store: stores.southEnd },

  // ============ PANTS & JEANS ============
  { id: 'p1', sku: 'celine-wool-trousers', title: 'Celine High-Rise Wool Trousers', brand: 'Celine', category: 'PANTS', condition: 'Excellent', priceCents: 75000, originalPriceCents: 115000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop', description: 'Impeccably tailored wool trousers in charcoal. Wide leg silhouette.', store: stores.nyc },
  { id: 'p2', sku: 'agolde-90s-jeans', title: 'AGOLDE 90s Pinch Waist Jeans', brand: 'AGOLDE', category: 'PANTS', condition: 'Excellent', priceCents: 12500, originalPriceCents: 19800, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop', description: 'High-rise straight leg jeans in medium vintage wash. Size 27.', store: stores.southEnd },
  { id: 'p3', sku: 'stella-mccartney-wide-leg', title: 'Stella McCartney Wide Leg Pants', brand: 'Stella McCartney', category: 'PANTS', condition: 'Very Good', priceCents: 35000, originalPriceCents: 55000, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop', description: 'Elegant wide-leg pants in navy wool blend. Sustainable luxury.', store: stores.backBay },
  { id: 'p4', sku: 'citizens-of-humanity-jeans', title: 'Citizens of Humanity Horseshoe', brand: 'Citizens of Humanity', category: 'PANTS', condition: 'Excellent', priceCents: 15500, originalPriceCents: 24800, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop', description: 'Relaxed curved leg jeans in faded blue. Cult favorite style.', store: stores.beaconHill },

  // ============ SKIRTS ============
  { id: 's1', sku: 'prada-pleated-midi', title: 'Prada Pleated Midi Skirt', brand: 'Prada', category: 'SKIRTS', condition: 'Excellent', priceCents: 75000, originalPriceCents: 120000, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj3g?w=600&h=600&fit=crop', description: 'Elegant knife-pleated midi skirt in black technical fabric.', store: stores.nyc },
  { id: 's2', sku: 'zimmermann-floral-mini', title: 'Zimmermann Floral Mini Skirt', brand: 'Zimmermann', category: 'SKIRTS', condition: 'Very Good', priceCents: 25000, originalPriceCents: 42500, image: 'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=600&h=600&fit=crop', description: 'Romantic floral print mini with ruffled hem. Perfect for summer.', store: stores.hamptons },
  { id: 's3', sku: 'gucci-logo-denim', title: 'Gucci GG Denim Mini Skirt', brand: 'Gucci', category: 'SKIRTS', condition: 'Excellent', priceCents: 85000, originalPriceCents: 130000, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj3g?w=600&h=600&fit=crop', description: 'Statement GG logo denim mini skirt with brass hardware.', store: stores.backBay },
  { id: 's4', sku: 'theory-pencil-skirt', title: 'Theory Stretch Wool Pencil Skirt', brand: 'Theory', category: 'SKIRTS', condition: 'Excellent', priceCents: 12500, originalPriceCents: 22500, image: 'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=600&h=600&fit=crop', description: 'Classic pencil skirt in black stretch wool. Office essential.', store: stores.southEnd },

  // ============ SWEATERS ============
  { id: 'sw1', sku: 'loro-piana-cashmere', title: 'Loro Piana Baby Cashmere Sweater', brand: 'Loro Piana', category: 'SWEATERS', condition: 'Excellent', priceCents: 185000, originalPriceCents: 280000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', description: 'Ultimate luxury baby cashmere turtleneck in oatmeal.', store: stores.hamptons },
  { id: 'sw2', sku: 'toteme-ribbed-knit', title: 'Totême Ribbed Wool Sweater', brand: 'Totême', category: 'SWEATERS', condition: 'Very Good', priceCents: 25000, originalPriceCents: 42000, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop', description: 'Minimalist ribbed sweater in cream merino wool.', store: stores.nyc },
  { id: 'sw3', sku: 'brunello-cucinelli-cardigan', title: 'Brunello Cucinelli Cardigan', brand: 'Brunello Cucinelli', category: 'SWEATERS', condition: 'Excellent', priceCents: 145000, originalPriceCents: 220000, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop', description: 'Luxurious cashmere-silk blend cardigan with monili trim.', store: stores.backBay },
  { id: 'sw4', sku: 'isabel-marant-fair-isle', title: 'Isabel Marant Fair Isle Sweater', brand: 'Isabel Marant', category: 'SWEATERS', condition: 'Excellent', priceCents: 45000, originalPriceCents: 72000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop', description: 'Statement fair isle sweater in autumnal palette.', store: stores.beaconHill },

  // ============ HANDBAGS ============
  { id: 'h1', sku: 'hermes-birkin-25-noir', title: 'Hermès Birkin 25 Togo Noir', brand: 'Hermès', category: 'HANDBAGS', condition: 'Excellent', priceCents: 1895000, originalPriceCents: 2200000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Pristine Hermès Birkin 25 in Noir Togo leather with gold hardware.', store: stores.backBay },
  { id: 'h2', sku: 'chanel-classic-flap-medium', title: 'Chanel Classic Flap Medium', brand: 'Chanel', category: 'HANDBAGS', condition: 'Very Good', priceCents: 785000, originalPriceCents: 1050000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', description: 'Timeless Chanel Classic Medium Flap in black caviar leather.', store: stores.southEnd },
  { id: 'h3', sku: 'louis-vuitton-neverfull-mm', title: 'Louis Vuitton Neverfull MM', brand: 'Louis Vuitton', category: 'HANDBAGS', condition: 'Very Good', priceCents: 145000, originalPriceCents: 200000, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=600&fit=crop', description: 'Versatile Louis Vuitton Neverfull MM in Damier Ebene canvas.', store: stores.backBay },
  { id: 'h4', sku: 'gucci-marmont-small', title: 'Gucci GG Marmont', brand: 'Gucci', category: 'HANDBAGS', condition: 'Excellent', priceCents: 165000, originalPriceCents: 250000, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop', description: 'Elegant Gucci GG Marmont small shoulder bag in dusty pink.', store: stores.southEnd },
  { id: 'h5', sku: 'dior-lady-dior', title: 'Dior Lady Dior Medium', brand: 'Dior', category: 'HANDBAGS', condition: 'Excellent', priceCents: 425000, originalPriceCents: 550000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Classic Lady Dior medium in black lambskin with silver hardware.', store: stores.nyc },
  { id: 'h6', sku: 'prada-galleria', title: 'Prada Galleria Saffiano', brand: 'Prada', category: 'HANDBAGS', condition: 'Very Good', priceCents: 195000, originalPriceCents: 295000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', description: 'Timeless Prada Galleria in black saffiano leather.', store: stores.southie },
  { id: 'h7', sku: 'bottega-veneta-pouch', title: 'Bottega Veneta The Pouch', brand: 'Bottega Veneta', category: 'HANDBAGS', condition: 'Excellent', priceCents: 225000, originalPriceCents: 320000, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop', description: 'Iconic oversized clutch in butter-soft black leather.', store: stores.hamptons },

  // ============ SHOES ============
  { id: 'sh1', sku: 'christian-louboutin-so-kate', title: 'Christian Louboutin So Kate 120', brand: 'Christian Louboutin', category: 'SHOES', condition: 'Very Good', priceCents: 45000, originalPriceCents: 72500, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop', description: 'Iconic red-soled stilettos in black patent leather. Size 38.', store: stores.nyc },
  { id: 'sh2', sku: 'manolo-blahnik-hangisi', title: 'Manolo Blahnik Hangisi', brand: 'Manolo Blahnik', category: 'SHOES', condition: 'Excellent', priceCents: 75000, originalPriceCents: 115000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop', description: 'The iconic blue satin pump with crystal buckle. Size 37.5.', store: stores.hamptons },
  { id: 'sh3', sku: 'gucci-horsebit-loafer', title: 'Gucci Horsebit Loafers', brand: 'Gucci', category: 'SHOES', condition: 'Excellent', priceCents: 55000, originalPriceCents: 85000, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop', description: 'Classic Gucci horsebit loafers in black leather. Size 39.', store: stores.backBay },
  { id: 'sh4', sku: 'chanel-ballet-flats', title: 'Chanel Ballet Flats', brand: 'Chanel', category: 'SHOES', condition: 'Very Good', priceCents: 65000, originalPriceCents: 95000, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop', description: 'Classic two-tone ballet flats with CC logo. Size 38.', store: stores.southEnd },
  { id: 'sh5', sku: 'jimmy-choo-romy', title: 'Jimmy Choo Romy Pumps', brand: 'Jimmy Choo', category: 'SHOES', condition: 'Excellent', priceCents: 35000, originalPriceCents: 55000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop', description: 'Elegant nude patent pumps with 85mm heel. Size 37.', store: stores.beaconHill },
  { id: 'sh6', sku: 'golden-goose-superstar', title: 'Golden Goose Superstar Sneakers', brand: 'Golden Goose', category: 'SHOES', condition: 'Very Good', priceCents: 32000, originalPriceCents: 52000, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop', description: 'Signature distressed sneakers with glitter star. Size 38.', store: stores.southie },

  // ============ JEWELRY ============
  { id: 'j1', sku: 'cartier-love-bracelet', title: 'Cartier Love Bracelet', brand: 'Cartier', category: 'JEWELRY', condition: 'Excellent', priceCents: 595000, originalPriceCents: 750000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Iconic Cartier Love bracelet in 18k yellow gold. Size 17.', store: stores.southie },
  { id: 'j2', sku: 'van-cleef-alhambra', title: 'VCA Vintage Alhambra Pendant', brand: 'Van Cleef & Arpels', category: 'JEWELRY', condition: 'Excellent', priceCents: 325000, originalPriceCents: 420000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', description: 'Signature Van Cleef & Arpels Vintage Alhambra pendant.', store: stores.hamptons },
  { id: 'j3', sku: 'tiffany-pendant', title: 'Tiffany Diamond Pendant', brand: 'Tiffany & Co.', category: 'JEWELRY', condition: 'New', priceCents: 285000, originalPriceCents: 350000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', description: 'Elegant Tiffany diamond solitaire pendant in platinum.', store: stores.beaconHill },
  { id: 'j4', sku: 'david-yurman-cable', title: 'David Yurman Cable Bracelet', brand: 'David Yurman', category: 'JEWELRY', condition: 'Excellent', priceCents: 45000, originalPriceCents: 65000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Classic cable bracelet with 18k gold dome. Size medium.', store: stores.backBay },
  { id: 'j5', sku: 'bvlgari-serpenti', title: 'Bvlgari Serpenti Bracelet', brand: 'Bvlgari', category: 'JEWELRY', condition: 'Excellent', priceCents: 385000, originalPriceCents: 520000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', description: 'Iconic Serpenti wrap bracelet in rose gold with diamonds.', store: stores.nyc },

  // ============ WATCHES ============
  { id: 'w1', sku: 'rolex-datejust-36', title: 'Rolex Datejust 36', brand: 'Rolex', category: 'WATCHES', condition: 'Excellent', priceCents: 895000, originalPriceCents: 1200000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Classic Rolex Datejust 36mm in steel and 18k yellow gold.', store: stores.beaconHill },
  { id: 'w2', sku: 'omega-speedmaster', title: 'Omega Speedmaster Moonwatch', brand: 'Omega', category: 'WATCHES', condition: 'Excellent', priceCents: 495000, originalPriceCents: 650000, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop', description: 'The legendary Omega Speedmaster Professional Moonwatch.', store: stores.backBay },
  { id: 'w3', sku: 'patek-nautilus', title: 'Patek Philippe Nautilus 5711', brand: 'Patek Philippe', category: 'WATCHES', condition: 'Excellent', priceCents: 12500000, originalPriceCents: 15000000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Iconic Patek Philippe Nautilus 5711/1A in stainless steel.', store: stores.hamptons },
  { id: 'w4', sku: 'cartier-tank', title: 'Cartier Tank Française', brand: 'Cartier', category: 'WATCHES', condition: 'Excellent', priceCents: 385000, originalPriceCents: 480000, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop', description: 'Elegant Cartier Tank Française in stainless steel. Medium size.', store: stores.nyc },
  { id: 'w5', sku: 'audemars-royal-oak', title: 'Audemars Piguet Royal Oak', brand: 'Audemars Piguet', category: 'WATCHES', condition: 'Excellent', priceCents: 2850000, originalPriceCents: 3500000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop', description: 'Iconic Royal Oak 37mm in stainless steel with blue dial.', store: stores.southEnd },

  // ============ ACCESSORIES (Belts, Scarves, etc.) ============
  { id: 'a1', sku: 'hermes-silk-scarf-90', title: 'Hermès Silk Carré 90', brand: 'Hermès', category: 'ACCESSORIES', condition: 'Excellent', priceCents: 35000, originalPriceCents: 48000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Vibrant Hermès silk scarf in the classic Brides de Gala pattern.', store: stores.backBay },
  { id: 'a2', sku: 'gucci-gg-belt', title: 'Gucci GG Marmont Belt', brand: 'Gucci', category: 'ACCESSORIES', condition: 'Very Good', priceCents: 32500, originalPriceCents: 45000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', description: 'Iconic double G buckle belt in black leather. Size 85.', store: stores.southEnd },
  { id: 'a3', sku: 'louis-vuitton-monogram-shawl', title: 'Louis Vuitton Monogram Shawl', brand: 'Louis Vuitton', category: 'ACCESSORIES', condition: 'Excellent', priceCents: 55000, originalPriceCents: 75000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Luxurious silk-wool blend shawl with LV monogram.', store: stores.nyc },
  { id: 'a4', sku: 'ferragamo-gancini-belt', title: 'Salvatore Ferragamo Gancini Belt', brand: 'Salvatore Ferragamo', category: 'ACCESSORIES', condition: 'Excellent', priceCents: 28500, originalPriceCents: 42000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', description: 'Reversible leather belt with signature Gancini buckle.', store: stores.beaconHill },
  { id: 'a5', sku: 'burberry-cashmere-scarf', title: 'Burberry Cashmere Check Scarf', brand: 'Burberry', category: 'ACCESSORIES', condition: 'Excellent', priceCents: 32000, originalPriceCents: 45000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', description: 'Classic heritage check scarf in pure cashmere.', store: stores.hamptons },
];

type Product = typeof allProducts[0];

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Product Modal
function ProductModal({ product, onClose, onAddToCart }: { product: Product | null; onClose: () => void; onAddToCart: () => void }) {
  if (!product) return null;

  const discount = Math.round(((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-brand-cream relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-brand-navy text-white font-mono text-xs px-3 py-1">
                {discount}% OFF
              </span>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-2">{product.brand}</p>
            <h2 className="font-heading text-2xl md:text-3xl text-brand-navy mb-4">{product.title}</h2>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-brand-navy">{formatPrice(product.priceCents)}</span>
              <span className="font-mono text-sm text-brand-muted line-through">{formatPrice(product.originalPriceCents)}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-cream font-mono text-xs text-brand-navy">{product.condition}</span>
              <span className="px-3 py-1 bg-green-50 font-mono text-xs text-green-700">Authenticated</span>
            </div>
            <p className="font-mono text-sm text-brand-muted leading-relaxed mb-8">{product.description}</p>
            <div className="mt-auto space-y-3">
              <button
                onClick={onAddToCart}
                className="w-full py-4 bg-brand-navy text-white font-mono text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
              >
                Add to Cart
              </button>
              <Link
                href={`/products/${product.sku}`}
                className="block w-full py-4 border-2 border-brand-navy text-brand-navy font-mono text-sm uppercase tracking-wider text-center hover:bg-brand-navy hover:text-white transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Chip
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-mono text-sm transition-colors ${
        active
          ? 'bg-brand-navy text-white'
          : 'bg-white border border-gray-200 text-brand-navy hover:border-brand-navy'
      }`}
    >
      {label}
    </button>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryParam = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<'price-high' | 'price-low'>('price-high');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login?redirect=/shop');
      return;
    }
    // TODO: Add to cart logic
    alert('Added to cart!');
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'DRESSES', label: 'Dresses' },
    { value: 'TOPS', label: 'Tops' },
    { value: 'OUTERWEAR', label: 'Coats & Jackets' },
    { value: 'PANTS', label: 'Pants & Jeans' },
    { value: 'SKIRTS', label: 'Skirts' },
    { value: 'SWEATERS', label: 'Sweaters' },
    { value: 'HANDBAGS', label: 'Handbags' },
    { value: 'SHOES', label: 'Shoes' },
    { value: 'JEWELRY', label: 'Jewelry' },
    { value: 'WATCHES', label: 'Watches' },
    { value: 'ACCESSORIES', label: 'Accessories' },
  ];

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (selectedCategory) {
      products = products.filter(p => p.category === selectedCategory);
    }

    products.sort((a, b) => {
      return sortBy === 'price-high'
        ? b.priceCents - a.priceCents
        : a.priceCents - b.priceCents;
    });

    return products;
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 lg:top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-6 lg:px-12 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl lg:text-3xl text-brand-navy">Shop</h1>
              <p className="font-mono text-sm text-brand-muted">{filteredProducts.length} items</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <FilterChip
                  key={cat.value}
                  label={cat.label}
                  active={selectedCategory === cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                />
              ))}
              <div className="w-px h-6 bg-gray-300 mx-2 hidden lg:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price-high' | 'price-low')}
                className="px-4 py-2 bg-white border border-gray-200 font-mono text-sm text-brand-navy focus:outline-none focus:border-brand-navy"
              >
                <option value="price-high">Price: High → Low</option>
                <option value="price-low">Price: Low → High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 lg:px-12 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-mono text-brand-muted mb-4">No products found</p>
            <button
              onClick={() => setSelectedCategory('')}
              className="font-mono text-sm text-brand-navy hover:opacity-60"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => {
              const discount = Math.round(
                ((product.originalPriceCents - product.priceCents) / product.originalPriceCents) * 100
              );

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group text-left"
                >
                  <div className="aspect-square bg-brand-cream mb-3 overflow-hidden relative rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-brand-navy shadow-lg">
                        Quick View
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-brand-navy text-white font-mono text-xs px-2 py-1 rounded">
                        {discount}% OFF
                      </span>
                    )}
                    {/* Store logo and authenticity badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.store.logo} alt={product.store.name} className="h-4 w-auto" />
                      <span className="font-mono text-[10px] text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Guaranteed Authentic
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-brand-muted mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-heading text-sm lg:text-base text-brand-navy mb-1 line-clamp-2 group-hover:opacity-60 transition-opacity">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm text-brand-navy">
                        {formatPrice(product.priceCents)}
                      </span>
                      {product.originalPriceCents > product.priceCents && (
                        <span className="font-mono text-xs text-brand-muted line-through">
                          {formatPrice(product.originalPriceCents)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite" />}>
      <ShopPageContent />
    </Suspense>
  );
}
