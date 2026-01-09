# Covet Stripe Payment Integration

## Overview

Covet uses Stripe Checkout for secure payment processing. The integration supports:
- Stripe Checkout Sessions (redirect-based payments)
- Webhook handlers for payment confirmation
- Demo mode for development without Stripe keys
- Platform fees (6% flagship, 10% partner)

## Quick Start

### Development (Demo Mode)

No configuration needed! The app runs in demo mode automatically when Stripe keys are not set.

```bash
npm run dev
```

Demo mode:
- Checkout redirects immediately to success page
- No real payments are processed
- Orders are marked as paid automatically
- Yellow "Demo Mode" banner appears on success page

### Production Setup

1. **Get Stripe API Keys**
   
   Visit [Stripe Dashboard](https://dashboard.stripe.com/apikeys) and copy:
   - Secret key (`sk_live_...` or `sk_test_...`)
   - Publishable key (`pk_live_...` or `pk_test_...`)

2. **Configure Environment**
   
   ```bash
   # .env.local
   STRIPE_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   ```

3. **Set Up Webhooks**
   
   In Stripe Dashboard → Webhooks:
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `charge.dispute.created`
   - Copy the signing secret (`whsec_...`)

   ```bash
   # .env.local
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Test Webhooks Locally**
   
   Use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  /checkout → POST /api/checkout → Stripe Checkout Session   │
│                                                              │
│  Stripe redirects → /checkout/success or /checkout/cancel   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
├─────────────────────────────────────────────────────────────┤
│  /api/checkout                                               │
│    1. Reserve product (atomic)                               │
│    2. Create order (PENDING)                                 │
│    3. Create Stripe session                                  │
│    4. Return checkout URL                                    │
├─────────────────────────────────────────────────────────────┤
│  /api/webhooks/stripe                                        │
│    checkout.session.completed:                               │
│      1. Update order to CONFIRMED                            │
│      2. Capture payment                                      │
│      3. Mark product as SOLD                                 │
│    checkout.session.expired:                                 │
│      1. Cancel order                                         │
│      2. Release product reservation                          │
└─────────────────────────────────────────────────────────────┘
```

## Checkout Flow

1. **User clicks "Complete Purchase"**
   - Frontend POSTs to `/api/checkout`
   - Product is atomically reserved (15 min window)
   - Order created with `PENDING` status

2. **Stripe Checkout Session created**
   - Line item with product details
   - Metadata includes orderId, productId, buyerId
   - Success/cancel URLs configured

3. **User redirected to Stripe**
   - Secure hosted payment page
   - Card details never touch our servers

4. **Payment completed**
   - Stripe redirects to `/checkout/success`
   - Webhook fires `checkout.session.completed`
   - Order marked `CONFIRMED`, product `SOLD`

5. **Payment failed/cancelled**
   - Stripe redirects to `/checkout/cancel`
   - Webhook fires `checkout.session.expired`
   - Order cancelled, reservation released

## Platform Fees

Fees are calculated based on store type:

| Store Type | Fee Rate | Example ($1,000) |
|------------|----------|------------------|
| Flagship   | 6%       | $60              |
| Partner    | 10%      | $100             |

Fees are recorded in the order and can be used for Stripe Connect payouts.

## Testing

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 3220 | 3D Secure required |

### Test Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Files

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client, checkout, webhooks |
| `src/app/api/checkout/route.ts` | Create checkout session |
| `src/app/api/webhooks/stripe/route.ts` | Handle Stripe events |
| `src/app/checkout/success/page.tsx` | Success page |
| `src/app/checkout/cancel/page.tsx` | Cancel page |

## Security Notes

- Webhook signatures are verified using `STRIPE_WEBHOOK_SECRET`
- Secret keys are never exposed to the client
- Payment data never touches our servers (Stripe Checkout)
- HTTPS required in production
- Atomic reservation prevents double-selling

## Future Enhancements

- [ ] Stripe Connect for seller payouts
- [ ] Partial refunds UI
- [ ] Saved payment methods
- [ ] Subscription support for premium sellers
- [ ] Apple Pay / Google Pay
