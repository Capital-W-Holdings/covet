# Covet Email Notifications

## Overview

Covet sends transactional emails for key events:
- **Welcome Email** - When a user registers
- **Order Confirmation** - When payment is captured
- **Seller Notification** - When an order is placed at their store
- **Shipping Confirmation** - When seller adds tracking
- **Delivery Confirmation** - When order is marked delivered

## Quick Start

### Development (Demo Mode)

No configuration needed! Emails are logged to the console.

```bash
npm run dev
# Watch console for "📧 Demo Email:" logs
```

### Production Setup

1. **Choose a Provider**
   - [Resend](https://resend.com) - Recommended for Next.js
   - [SendGrid](https://sendgrid.com) - Industry standard
   - [Postmark](https://postmarkapp.com) - Reliable delivery

2. **Configure Environment**

```bash
# .env.local
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="re_..."
EMAIL_FROM="Covet <orders@covet.com>"
```

3. **Verify Domain** (required for production)
   - Add DNS records for your domain in your provider's dashboard
   - This prevents emails from going to spam

## Supported Providers

### Resend (Recommended)

```bash
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="re_xxx"
EMAIL_FROM="Covet <orders@covet.com>"
```

Get API key: https://resend.com/api-keys

### SendGrid

```bash
EMAIL_PROVIDER="sendgrid"
EMAIL_API_KEY="SG.xxx"
EMAIL_FROM="orders@covet.com"
```

Get API key: https://app.sendgrid.com/settings/api_keys

### Postmark

```bash
EMAIL_PROVIDER="postmark"
EMAIL_API_KEY="xxx-xxx-xxx-xxx"
EMAIL_FROM="orders@covet.com"
```

Get API key: https://account.postmarkapp.com/servers

## Email Templates

All templates use inline CSS for maximum email client compatibility.

| Template | Trigger | Contents |
|----------|---------|----------|
| Welcome | User registration | Brand intro, getting started |
| Order Confirmation | Payment captured | Order details, shipping address |
| Seller Notification | Order placed | Order details, call to action |
| Shipping Confirmation | Tracking added | Tracking info, carrier links |
| Delivery Confirmation | Order delivered | Review prompt, dispute info |

## Architecture

```
src/lib/email/
├── index.ts          # Barrel exports
├── service.ts        # Provider abstraction
├── templates.ts      # HTML/text templates
└── notifications.ts  # High-level send functions
```

## Usage Examples

```typescript
import { sendOrderConfirmation } from '@/lib/email/notifications';

// Send order confirmation
await sendOrderConfirmation(
  'buyer@example.com',
  order,
  { title: 'Hermès Birkin', brand: 'Hermès', sku: 'xyz' }
);
```

## Testing Emails

1. **Console Logging** (Demo Mode)
   - Leave EMAIL_PROVIDER unset
   - All emails logged to console

2. **Email Preview**
   - Use Resend's preview feature
   - Or send to a test email address

3. **Unit Tests**
   ```bash
   npm test -- email.test.ts
   ```

## Customization

### Adding New Templates

1. Add template function to `templates.ts`:
```typescript
export function myNewTemplate(data: MyData): { html: string; text: string; subject: string } {
  // Use emailWrapper() for consistent styling
}
```

2. Add notification function to `notifications.ts`:
```typescript
export async function sendMyNewEmail(...): Promise<SendEmailResult> {
  const template = myNewTemplate(data);
  return sendEmail({ to, ...template });
}
```

### Changing Styles

Edit the `COLORS` object in `templates.ts`:
```typescript
const COLORS = {
  gold: '#B8860B',     // Brand accent
  cream: '#FAF8F5',    // Background
  charcoal: '#1A1A1A', // Text
  // ...
};
```

## Tracking & Analytics

Each email includes tags for analytics:
- `type`: Email type (e.g., 'order_confirmation')
- `orderId`: Related order ID
- `orderNumber`: Human-readable order number

Access these in your email provider's dashboard.

## Troubleshooting

### Emails Not Sending
- Check `EMAIL_API_KEY` is set correctly
- Verify domain is configured in provider

### Emails Going to Spam
- Set up SPF, DKIM, and DMARC records
- Use a verified domain, not free email

### Template Issues
- Test with inline styles only
- Avoid complex CSS (flexbox, grid)

## Security

- API keys stored in environment variables
- Never log email content in production
- Webhook signatures verified for inbound
