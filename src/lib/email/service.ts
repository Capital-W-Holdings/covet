/**
 * Email Service
 * 
 * Provides transactional email functionality with support for:
 * - Demo mode (logs emails to console)
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - Postmark
 * 
 * Required environment variables:
 * - EMAIL_PROVIDER: 'resend' | 'sendgrid' | 'postmark' (optional, defaults to demo)
 * - EMAIL_API_KEY: API key for the provider
 * - EMAIL_FROM: Default sender email (e.g., "Covet <orders@covet.com>")
 */

// Email types
export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface SendEmailParams {
  to: string | EmailAddress | (string | EmailAddress)[];
  subject: string;
  html: string;
  text?: string;
  from?: string | EmailAddress;
  replyTo?: string | EmailAddress;
  attachments?: EmailAttachment[];
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Check if we're in demo mode
export function isEmailDemo(): boolean {
  return !process.env.EMAIL_API_KEY || !process.env.EMAIL_PROVIDER;
}

// Get default from address
function getDefaultFrom(): string {
  return process.env.EMAIL_FROM || 'Covet <noreply@covet.com>';
}

// Format email address
function formatAddress(addr: string | EmailAddress): string {
  if (typeof addr === 'string') return addr;
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

/**
 * Send an email
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const from = params.from ? formatAddress(params.from) : getDefaultFrom();
  const to = Array.isArray(params.to) 
    ? params.to.map(formatAddress) 
    : [formatAddress(params.to)];

  // Demo mode - log to console
  if (isEmailDemo()) {
    console.log('📧 Demo Email:');
    console.log(`   From: ${from}`);
    console.log(`   To: ${to.join(', ')}`);
    console.log(`   Subject: ${params.subject}`);
    console.log(`   ---`);
    // Log first 200 chars of text content
    const textPreview = params.text?.substring(0, 200) || 
      params.html.replace(/<[^>]*>/g, '').substring(0, 200);
    console.log(`   ${textPreview}...`);
    console.log('');
    
    return {
      success: true,
      messageId: `demo_${Date.now()}`,
    };
  }

  const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
  const apiKey = process.env.EMAIL_API_KEY!;

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend(from, to, params, apiKey);
      case 'sendgrid':
        return await sendViaSendGrid(from, to, params, apiKey);
      case 'postmark':
        return await sendViaPostmark(from, to, params, apiKey);
      default:
        console.warn(`Unknown email provider: ${provider}, falling back to demo mode`);
        return { success: true, messageId: `demo_${Date.now()}` };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send via Resend
 */
async function sendViaResend(
  from: string,
  to: string[],
  params: SendEmailParams,
  apiKey: string
): Promise<SendEmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo ? formatAddress(params.replyTo) : undefined,
      tags: params.tags ? Object.entries(params.tags).map(([name, value]) => ({ name, value })) : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}

/**
 * Send via SendGrid
 */
async function sendViaSendGrid(
  from: string,
  to: string[],
  params: SendEmailParams,
  apiKey: string
): Promise<SendEmailResult> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map(email => ({ email })) }],
      from: { email: from.includes('<') ? from.match(/<(.+)>/)?.[1] : from },
      subject: params.subject,
      content: [
        ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
        { type: 'text/html', value: params.html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  // SendGrid returns 202 with no body on success
  const messageId = response.headers.get('x-message-id') || `sg_${Date.now()}`;
  return { success: true, messageId };
}

/**
 * Send via Postmark
 */
async function sendViaPostmark(
  from: string,
  to: string[],
  params: SendEmailParams,
  apiKey: string
): Promise<SendEmailResult> {
  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      From: from,
      To: to.join(','),
      Subject: params.subject,
      HtmlBody: params.html,
      TextBody: params.text,
      ReplyTo: params.replyTo ? formatAddress(params.replyTo) : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Postmark error: ${error}`);
  }

  const data = await response.json();
  return { success: true, messageId: data.MessageID };
}

/**
 * Send multiple emails (batch)
 */
export async function sendEmails(
  emails: SendEmailParams[]
): Promise<SendEmailResult[]> {
  return Promise.all(emails.map(sendEmail));
}
