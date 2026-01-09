// Price Alert Types
export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPriceCents: number;
  currentPriceCents: number;
  createdAt: Date;
  updatedAt: Date;
  triggeredAt?: Date;
  isActive: boolean;
}

export interface CreatePriceAlertDTO {
  productId: string;
  targetPriceCents: number;
}

export interface PriceAlertWithProduct extends PriceAlert {
  product: {
    id: string;
    sku: string;
    title: string;
    brand: string;
    priceCents: number;
    images: { url: string; alt: string }[];
  };
}
