/**
 * Email Templates
 * 
 * Reusable HTML email templates for transactional emails.
 * All templates use inline styles for maximum email client compatibility.
 */

import type { Order, Product } from '@/types';
import { formatPrice } from '@/lib/utils';

// Brand colors
const COLORS = {
  gold: '#B8860B',
  cream: '#FAF8F5',
  charcoal: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  green: '#059669',
  white: '#FFFFFF',
};

// Base email wrapper
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Covet</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.cream};">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 20px 0; text-align: center; border-bottom: 1px solid ${COLORS.lightGray};">
              <span style="font-size: 24px; font-weight: 300; letter-spacing: 4px; color: ${COLORS.charcoal};">COVET</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: ${COLORS.gray}; font-size: 12px;">
              <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Covet. All rights reserved.</p>
              <p style="margin: 0;">234 Newbury Street, Boston, MA 02116</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Button component
function button(text: string, href: string, primary = true): string {
  const bgColor = primary ? COLORS.charcoal : COLORS.white;
  const textColor = primary ? COLORS.white : COLORS.charcoal;
  const border = primary ? 'none' : `2px solid ${COLORS.charcoal}`;
  
  return `
    <a href="${href}" style="display: inline-block; padding: 14px 28px; background-color: ${bgColor}; color: ${textColor}; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 4px; border: ${border};">${text}</a>
  `;
}

// Product card for emails
function productCard(
  title: string,
  brand: string,
  price: number,
  imageUrl?: string,
  sku?: string
): string {
  return `
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        ${imageUrl ? `
        <td style="width: 120px; vertical-align: top;">
          <img src="${imageUrl}" alt="${title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid ${COLORS.lightGray};">
        </td>
        ` : ''}
        <td style="vertical-align: top; padding-left: ${imageUrl ? '20px' : '0'};">
          <p style="margin: 0 0 4px; font-size: 12px; color: ${COLORS.gray}; text-transform: uppercase; letter-spacing: 1px;">${brand}</p>
          <p style="margin: 0 0 8px; font-size: 16px; font-weight: 500; color: ${COLORS.charcoal};">${title}</p>
          <p style="margin: 0; font-size: 18px; color: ${COLORS.charcoal};">${formatPrice(price)}</p>
          ${sku ? `<p style="margin: 8px 0 0; font-size: 12px; color: ${COLORS.gray};">SKU: ${sku}</p>` : ''}
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// ORDER CONFIRMATION
// ============================================================================

export interface OrderConfirmationData {
  order: Order;
  product: {
    title: string;
    brand: string;
    imageUrl?: string;
    sku: string;
  };
  appUrl: string;
}

export function orderConfirmationTemplate(data: OrderConfirmationData): { html: string; text: string; subject: string } {
  const { order, product, appUrl } = data;
  
  const html = emailWrapper(`
    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 400; color: ${COLORS.charcoal};">Thank you for your order!</h1>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: ${COLORS.gray}; line-height: 1.6;">
      Your order has been confirmed and we're preparing it for shipment. You'll receive another email when your item ships.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${COLORS.cream}; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: ${COLORS.gray}; text-transform: uppercase;">Order Number</p>
          <p style="margin: 0; font-size: 18px; font-weight: 500; font-family: monospace; color: ${COLORS.charcoal};">${order.orderNumber}</p>
        </td>
      </tr>
    </table>
    
    <h2 style="margin: 30px 0 10px; font-size: 16px; font-weight: 500; color: ${COLORS.charcoal};">Order Details</h2>
    
    ${productCard(product.title, product.brand, order.item.priceCents, product.imageUrl, product.sku)}
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; border-top: 1px solid ${COLORS.lightGray}; padding-top: 20px;">
      <tr>
        <td style="padding: 8px 0; color: ${COLORS.gray};">Subtotal</td>
        <td style="padding: 8px 0; text-align: right; color: ${COLORS.charcoal};">${formatPrice(order.subtotalCents)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${COLORS.gray};">Shipping</td>
        <td style="padding: 8px 0; text-align: right; color: ${COLORS.charcoal};">${order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}</td>
      </tr>
      <tr style="border-top: 1px solid ${COLORS.lightGray};">
        <td style="padding: 16px 0 0; font-size: 18px; font-weight: 500; color: ${COLORS.charcoal};">Total</td>
        <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 500; color: ${COLORS.charcoal};">${formatPrice(order.totalCents)}</td>
      </tr>
    </table>
    
    <h2 style="margin: 30px 0 10px; font-size: 16px; font-weight: 500; color: ${COLORS.charcoal};">Shipping Address</h2>
    
    <p style="margin: 0; font-size: 14px; color: ${COLORS.gray}; line-height: 1.6;">
      ${order.shipping.address.name}<br>
      ${order.shipping.address.street1}<br>
      ${order.shipping.address.street2 ? `${order.shipping.address.street2}<br>` : ''}
      ${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postalCode}
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      ${button('View Order', `${appUrl}/account/orders/${order.id}`)}
    </div>
    
    <p style="margin: 40px 0 0; font-size: 14px; color: ${COLORS.gray}; text-align: center;">
      Questions? Reply to this email or contact us at <a href="mailto:support@covet.com" style="color: ${COLORS.gold};">support@covet.com</a>
    </p>
  `);

  const text = `
Thank you for your order!

Order Number: ${order.orderNumber}

${product.brand} - ${product.title}
${formatPrice(order.item.priceCents)}

Subtotal: ${formatPrice(order.subtotalCents)}
Shipping: ${order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
Total: ${formatPrice(order.totalCents)}

Shipping to:
${order.shipping.address.name}
${order.shipping.address.street1}
${order.shipping.address.street2 || ''}
${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postalCode}

View your order: ${appUrl}/account/orders/${order.id}

Questions? Contact support@covet.com

© ${new Date().getFullYear()} Covet
  `.trim();

  return {
    html,
    text,
    subject: `Order Confirmed - ${order.orderNumber}`,
  };
}

// ============================================================================
// SHIPPING CONFIRMATION
// ============================================================================

export interface ShippingConfirmationData {
  order: Order;
  product: {
    title: string;
    brand: string;
    imageUrl?: string;
  };
  trackingUrl?: string;
  appUrl: string;
}

export function shippingConfirmationTemplate(data: ShippingConfirmationData): { html: string; text: string; subject: string } {
  const { order, product, trackingUrl, appUrl } = data;
  
  const html = emailWrapper(`
    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 400; color: ${COLORS.charcoal};">Your order has shipped!</h1>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: ${COLORS.gray}; line-height: 1.6;">
      Great news! Your order is on its way. Here are your tracking details:
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${COLORS.cream}; border-radius: 8px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">
                <p style="margin: 0; font-size: 12px; color: ${COLORS.gray}; text-transform: uppercase;">Carrier</p>
                <p style="margin: 4px 0 0; font-size: 16px; color: ${COLORS.charcoal};">${order.shipping.carrier || 'Standard Shipping'}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <p style="margin: 0; font-size: 12px; color: ${COLORS.gray}; text-transform: uppercase;">Tracking Number</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-family: monospace; color: ${COLORS.charcoal};">${order.shipping.trackingNumber || 'Not available'}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${trackingUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      ${button('Track Package', trackingUrl)}
    </div>
    ` : ''}
    
    <h2 style="margin: 30px 0 10px; font-size: 16px; font-weight: 500; color: ${COLORS.charcoal};">What's Shipping</h2>
    
    ${productCard(product.title, product.brand, order.item.priceCents, product.imageUrl)}
    
    <h2 style="margin: 30px 0 10px; font-size: 16px; font-weight: 500; color: ${COLORS.charcoal};">Shipping To</h2>
    
    <p style="margin: 0; font-size: 14px; color: ${COLORS.gray}; line-height: 1.6;">
      ${order.shipping.address.name}<br>
      ${order.shipping.address.street1}<br>
      ${order.shipping.address.street2 ? `${order.shipping.address.street2}<br>` : ''}
      ${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postalCode}
    </p>
    
    <p style="margin: 40px 0 0; font-size: 14px; color: ${COLORS.gray}; text-align: center;">
      Order: <a href="${appUrl}/account/orders/${order.id}" style="color: ${COLORS.gold};">${order.orderNumber}</a>
    </p>
  `);

  const text = `
Your order has shipped!

Carrier: ${order.shipping.carrier || 'Standard Shipping'}
Tracking: ${order.shipping.trackingNumber || 'Not available'}
${trackingUrl ? `Track: ${trackingUrl}` : ''}

${product.brand} - ${product.title}

Shipping to:
${order.shipping.address.name}
${order.shipping.address.street1}
${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postalCode}

Order: ${order.orderNumber}
View order: ${appUrl}/account/orders/${order.id}

© ${new Date().getFullYear()} Covet
  `.trim();

  return {
    html,
    text,
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
  };
}

// ============================================================================
// DELIVERY CONFIRMATION
// ============================================================================

export interface DeliveryConfirmationData {
  order: Order;
  product: {
    title: string;
    brand: string;
    imageUrl?: string;
  };
  appUrl: string;
}

export function deliveryConfirmationTemplate(data: DeliveryConfirmationData): { html: string; text: string; subject: string } {
  const { order, product, appUrl } = data;
  
  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background-color: #D1FAE5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="font-size: 30px;">✓</span>
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 400; color: ${COLORS.charcoal};">Your order has been delivered!</h1>
    </div>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: ${COLORS.gray}; line-height: 1.6; text-align: center;">
      We hope you love your new ${product.brand} piece. If you have any questions or concerns, please let us know within 14 days.
    </p>
    
    ${productCard(product.title, product.brand, order.item.priceCents, product.imageUrl)}
    
    <div style="text-align: center; margin: 40px 0;">
      ${button('Leave a Review', `${appUrl}/account/orders/${order.id}/review`)}
    </div>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${COLORS.cream}; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 14px; color: ${COLORS.gray};">Need to report an issue?</p>
          <a href="${appUrl}/account/orders/${order.id}/dispute" style="color: ${COLORS.gold}; text-decoration: none; font-size: 14px;">Open a dispute within 14 days</a>
        </td>
      </tr>
    </table>
  `);

  const text = `
Your order has been delivered!

${product.brand} - ${product.title}

We hope you love your new piece. If you have any questions or concerns, please let us know within 14 days.

Leave a review: ${appUrl}/account/orders/${order.id}/review
Open a dispute: ${appUrl}/account/orders/${order.id}/dispute

Order: ${order.orderNumber}

© ${new Date().getFullYear()} Covet
  `.trim();

  return {
    html,
    text,
    subject: `Delivered: ${product.brand} - ${product.title}`,
  };
}

// ============================================================================
// WELCOME EMAIL
// ============================================================================

export interface WelcomeEmailData {
  userName: string;
  appUrl: string;
}

export function welcomeEmailTemplate(data: WelcomeEmailData): { html: string; text: string; subject: string } {
  const { userName, appUrl } = data;
  
  const html = emailWrapper(`
    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 400; color: ${COLORS.charcoal};">Welcome to Covet, ${userName}!</h1>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: ${COLORS.gray}; line-height: 1.6;">
      Thank you for joining Boston's premier destination for authenticated luxury consignment. We're thrilled to have you.
    </p>
    
    <h2 style="margin: 30px 0 15px; font-size: 18px; font-weight: 500; color: ${COLORS.charcoal};">Why Covet?</h2>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.lightGray};">
          <strong style="color: ${COLORS.charcoal};">100% Authenticated</strong>
          <p style="margin: 5px 0 0; font-size: 14px; color: ${COLORS.gray};">Every item is verified by our expert team</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.lightGray};">
          <strong style="color: ${COLORS.charcoal};">Curated Selection</strong>
          <p style="margin: 5px 0 0; font-size: 14px; color: ${COLORS.gray};">Handpicked luxury from trusted sellers</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px 0;">
          <strong style="color: ${COLORS.charcoal};">Buyer Protection</strong>
          <p style="margin: 5px 0 0; font-size: 14px; color: ${COLORS.gray};">14-day window to verify your purchase</p>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 40px 0;">
      ${button('Start Shopping', `${appUrl}/shop`)}
    </div>
    
    <p style="margin: 40px 0 0; font-size: 14px; color: ${COLORS.gray}; text-align: center;">
      Questions? We're here to help at <a href="mailto:support@covet.com" style="color: ${COLORS.gold};">support@covet.com</a>
    </p>
  `);

  const text = `
Welcome to Covet, ${userName}!

Thank you for joining Boston's premier destination for authenticated luxury consignment.

Why Covet?

• 100% Authenticated - Every item is verified by our expert team
• Curated Selection - Handpicked luxury from trusted sellers  
• Buyer Protection - 14-day window to verify your purchase

Start shopping: ${appUrl}/shop

Questions? Contact support@covet.com

© ${new Date().getFullYear()} Covet
  `.trim();

  return {
    html,
    text,
    subject: 'Welcome to Covet - Luxury, Authenticated',
  };
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetTemplate(data: PasswordResetData): { html: string; text: string; subject: string } {
  const { userName, resetUrl, expiresIn } = data;
  
  const html = emailWrapper(`
    <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 400; color: ${COLORS.charcoal};">Reset Your Password</h1>
    
    <p style="margin: 0 0 20px; font-size: 16px; color: ${COLORS.gray}; line-height: 1.6;">
      Hi ${userName}, we received a request to reset your password. Click the button below to create a new password:
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      ${button('Reset Password', resetUrl)}
    </div>
    
    <p style="margin: 0 0 20px; font-size: 14px; color: ${COLORS.gray}; text-align: center;">
      This link expires in ${expiresIn}.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${COLORS.cream}; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; color: ${COLORS.gray};">
            If you didn't request this, you can safely ignore this email. Your password will not be changed.
          </p>
        </td>
      </tr>
    </table>
  `);

  const text = `
Reset Your Password

Hi ${userName}, we received a request to reset your password.

Reset your password: ${resetUrl}

This link expires in ${expiresIn}.

If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} Covet
  `.trim();

  return {
    html,
    text,
    subject: 'Reset Your Covet Password',
  };
}
