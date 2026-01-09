/**
 * Email Notification Service
 * 
 * Mock implementation for development.
 * In production, integrate with SendGrid, Resend, or AWS SES.
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationData {
  buyerName: string;
  buyerEmail: string;
  orderNumber: string;
  productTitle: string;
  productImage?: string;
  totalAmount: string;
  shippingAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface OrderShippedData {
  buyerName: string;
  buyerEmail: string;
  orderNumber: string;
  productTitle: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface DisputeOpenedData {
  sellerName: string;
  sellerEmail: string;
  orderNumber: string;
  productTitle: string;
  reason: string;
  disputeId: string;
}

export interface ApplicationStatusData {
  applicantName: string;
  applicantEmail: string;
  businessName: string;
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
  notes?: string;
}

/**
 * Mock email sender - logs to console in development
 */
async function sendEmail(template: EmailTemplate): Promise<boolean> {
  // In production, replace with actual email service
  console.log('📧 [EMAIL] Sending email:');
  console.log(`   To: ${template.to}`);
  console.log(`   Subject: ${template.subject}`);
  console.log(`   Preview: ${template.text?.substring(0, 100) || template.html.substring(0, 100)}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return true;
}

/**
 * Send order confirmation email to buyer
 */
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
  const template: EmailTemplate = {
    to: data.buyerEmail,
    subject: `Order Confirmed - ${data.orderNumber}`,
    html: `
      <h1>Thank you for your order, ${data.buyerName}!</h1>
      <p>Your order <strong>${data.orderNumber}</strong> has been confirmed.</p>
      <h2>${data.productTitle}</h2>
      <p>Total: ${data.totalAmount}</p>
      <h3>Shipping to:</h3>
      <p>
        ${data.shippingAddress.name}<br>
        ${data.shippingAddress.street1}<br>
        ${data.shippingAddress.street2 ? data.shippingAddress.street2 + '<br>' : ''}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
        ${data.shippingAddress.country}
      </p>
      <p>We'll notify you when your item ships.</p>
    `,
    text: `Thank you for your order, ${data.buyerName}! Order ${data.orderNumber} confirmed. Total: ${data.totalAmount}`,
  };

  return sendEmail(template);
}

/**
 * Send order shipped notification to buyer
 */
export async function sendOrderShipped(data: OrderShippedData): Promise<boolean> {
  const template: EmailTemplate = {
    to: data.buyerEmail,
    subject: `Your Order Has Shipped - ${data.orderNumber}`,
    html: `
      <h1>Great news, ${data.buyerName}!</h1>
      <p>Your order <strong>${data.orderNumber}</strong> is on its way.</p>
      <h2>${data.productTitle}</h2>
      ${data.carrier ? `<p>Carrier: ${data.carrier}</p>` : ''}
      ${data.trackingNumber ? `<p>Tracking Number: ${data.trackingNumber}</p>` : ''}
      ${data.trackingUrl ? `<p><a href="${data.trackingUrl}">Track your package</a></p>` : ''}
      <p>Thank you for shopping with Covet!</p>
    `,
    text: `Your order ${data.orderNumber} has shipped! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ''}`,
  };

  return sendEmail(template);
}

/**
 * Send order delivered notification to buyer
 */
export async function sendOrderDelivered(data: { buyerName: string; buyerEmail: string; orderNumber: string; productTitle: string; orderId: string }): Promise<boolean> {
  const template: EmailTemplate = {
    to: data.buyerEmail,
    subject: `Order Delivered - ${data.orderNumber}`,
    html: `
      <h1>Your order has been delivered!</h1>
      <p>Hi ${data.buyerName},</p>
      <p>Your order <strong>${data.orderNumber}</strong> has been marked as delivered.</p>
      <h2>${data.productTitle}</h2>
      <p>We hope you love your new item!</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/account/orders/${data.orderId}/review">Leave a review</a></p>
      <p>If there's any issue with your order, you can <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/account/orders/${data.orderId}/dispute">open a dispute</a> within 14 days.</p>
    `,
    text: `Your order ${data.orderNumber} has been delivered! Leave a review at /account/orders/${data.orderId}/review`,
  };

  return sendEmail(template);
}

/**
 * Send dispute opened notification to seller
 */
export async function sendDisputeOpened(data: DisputeOpenedData): Promise<boolean> {
  const template: EmailTemplate = {
    to: data.sellerEmail,
    subject: `Dispute Opened - Order ${data.orderNumber}`,
    html: `
      <h1>A dispute has been opened</h1>
      <p>Hi ${data.sellerName},</p>
      <p>A buyer has opened a dispute for order <strong>${data.orderNumber}</strong>.</p>
      <h2>${data.productTitle}</h2>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please respond within 48 hours to avoid escalation.</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/store/disputes/${data.disputeId}">View Dispute</a></p>
    `,
    text: `Dispute opened for order ${data.orderNumber}. Reason: ${data.reason}. Please respond within 48 hours.`,
  };

  return sendEmail(template);
}

/**
 * Send application status update to applicant
 */
export async function sendApplicationStatus(data: ApplicationStatusData): Promise<boolean> {
  const statusMessages = {
    APPROVED: 'Congratulations! Your seller application has been approved.',
    REJECTED: 'Unfortunately, your seller application was not approved at this time.',
    NEEDS_INFO: 'We need additional information to process your seller application.',
  };

  const template: EmailTemplate = {
    to: data.applicantEmail,
    subject: `Seller Application Update - ${data.businessName}`,
    html: `
      <h1>Application Update</h1>
      <p>Hi ${data.applicantName},</p>
      <p>${statusMessages[data.status]}</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      ${data.status === 'APPROVED' ? `
        <p>You can now access your seller dashboard and start listing products.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/store">Go to Seller Dashboard</a></p>
      ` : ''}
      ${data.status === 'NEEDS_INFO' ? `
        <p>Please update your application with the requested information.</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sell">Update Application</a></p>
      ` : ''}
    `,
    text: statusMessages[data.status],
  };

  return sendEmail(template);
}

/**
 * Send new order notification to seller
 */
export async function sendNewOrderToSeller(data: {
  sellerName: string;
  sellerEmail: string;
  orderNumber: string;
  productTitle: string;
  totalAmount: string;
  orderId: string;
}): Promise<boolean> {
  const template: EmailTemplate = {
    to: data.sellerEmail,
    subject: `New Order - ${data.orderNumber}`,
    html: `
      <h1>You have a new order!</h1>
      <p>Hi ${data.sellerName},</p>
      <p>Order <strong>${data.orderNumber}</strong> has been placed for:</p>
      <h2>${data.productTitle}</h2>
      <p>Total: ${data.totalAmount}</p>
      <p>Please ship within 3 business days.</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/store/orders/${data.orderId}">View Order</a></p>
    `,
    text: `New order ${data.orderNumber}! ${data.productTitle} - ${data.totalAmount}. Ship within 3 business days.`,
  };

  return sendEmail(template);
}
