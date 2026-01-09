import { sendEmail, type SendEmailResult } from './service';
import {
  orderConfirmationTemplate,
  shippingConfirmationTemplate,
  deliveryConfirmationTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
  type OrderConfirmationData,
  type ShippingConfirmationData,
  type DeliveryConfirmationData,
  type WelcomeEmailData,
  type PasswordResetData,
} from './templates';
import type { Order } from '@/types';

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

const CARRIER_URLS: Record<string, (t: string) => string> = {
  'UPS': (t) => `https://www.ups.com/track?tracknum=${t}`,
  'USPS': (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  'FedEx': (t) => `https://www.fedex.com/fedextrack/?trknbr=${t}`,
  'DHL': (t) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${t}`,
};

function getTrackingUrl(carrier?: string, tracking?: string): string | undefined {
  if (!carrier || !tracking) return undefined;
  return CARRIER_URLS[carrier]?.(tracking);
}

export async function sendOrderConfirmation(
  email: string,
  order: Order,
  product: { title: string; brand: string; imageUrl?: string; sku: string }
): Promise<SendEmailResult> {
  const data: OrderConfirmationData = { order, product, appUrl: getAppUrl() };
  const template = orderConfirmationTemplate(data);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: { type: 'order_confirmation', orderId: order.id, orderNumber: order.orderNumber },
  });
}

export async function sendShippingConfirmation(
  email: string,
  order: Order,
  product: { title: string; brand: string; imageUrl?: string }
): Promise<SendEmailResult> {
  const trackingUrl = getTrackingUrl(order.shipping.carrier, order.shipping.trackingNumber);
  const data: ShippingConfirmationData = { order, product, trackingUrl, appUrl: getAppUrl() };
  const template = shippingConfirmationTemplate(data);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: { type: 'shipping_confirmation', orderId: order.id, orderNumber: order.orderNumber },
  });
}

export async function sendDeliveryConfirmation(
  email: string,
  order: Order,
  product: { title: string; brand: string; imageUrl?: string }
): Promise<SendEmailResult> {
  const data: DeliveryConfirmationData = { order, product, appUrl: getAppUrl() };
  const template = deliveryConfirmationTemplate(data);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: { type: 'delivery_confirmation', orderId: order.id, orderNumber: order.orderNumber },
  });
}

export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<SendEmailResult> {
  const data: WelcomeEmailData = { userName, appUrl: getAppUrl() };
  const template = welcomeEmailTemplate(data);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: { type: 'welcome' },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
): Promise<SendEmailResult> {
  const appUrl = getAppUrl();
  const data: PasswordResetData = {
    userName,
    resetUrl: `${appUrl}/reset-password?token=${resetToken}`,
    expiresIn: '1 hour',
  };
  const template = passwordResetTemplate(data);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: { type: 'password_reset' },
  });
}

export async function sendSellerOrderNotification(
  sellerEmail: string,
  order: Order,
  product: { title: string; brand: string; imageUrl?: string; sku: string },
  buyerName: string
): Promise<SendEmailResult> {
  const appUrl = getAppUrl();
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; font-weight: 400; color: #1A1A1A;">New Order Received!</h1>
      <p style="color: #6B7280; font-size: 16px;">You have a new order for ${product.brand} - ${product.title}.</p>
      <div style="background: #FAF8F5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px;"><strong>Order:</strong> ${order.orderNumber}</p>
        <p style="margin: 0 0 10px;"><strong>Buyer:</strong> ${buyerName}</p>
        <p style="margin: 0 0 10px;"><strong>Item:</strong> ${product.title}</p>
        <p style="margin: 0 0 10px;"><strong>SKU:</strong> ${product.sku}</p>
        <p style="margin: 0;"><strong>Amount:</strong> $${(order.totalCents / 100).toFixed(2)}</p>
      </div>
      <p style="color: #6B7280;">Please prepare this item for shipment.</p>
      <a href="${appUrl}/store/orders/${order.id}" style="display: inline-block; padding: 14px 28px; background-color: #1A1A1A; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">View Order</a>
    </div>
  `;
  const text = `New Order: ${order.orderNumber}\nBuyer: ${buyerName}\nItem: ${product.brand} - ${product.title}\nAmount: $${(order.totalCents / 100).toFixed(2)}`;
  return sendEmail({
    to: sellerEmail,
    subject: `New Order: ${product.brand} - ${product.title}`,
    html,
    text,
    tags: { type: 'seller_order_notification', orderId: order.id, orderNumber: order.orderNumber },
  });
}
