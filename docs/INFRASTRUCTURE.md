# Covet Infrastructure Guide

## Overview

Covet is deployed using a modern serverless architecture optimized for luxury e-commerce workloads.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COVET INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CLIENTS                    EDGE                      ORIGIN                │
│   ───────                    ────                      ──────                │
│   Web Browser ──────────► Vercel Edge ──────────► Next.js App               │
│   Mobile App                  │ CDN                       │                  │
│                               │                           │                  │
│   ┌───────────────────────────┴───────────────────────────┴────────────────┐│
│   │                                                                         ││
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ││
│   │   │  PostgreSQL │  │    Redis    │  │     S3      │  │   Stripe    │  ││
│   │   │  (Supabase) │  │  (Upstash)  │  │ (CloudFront)│  │  (Payments) │  ││
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  ││
│   │        ▲                 ▲                 ▲                ▲          ││
│   │        │                 │                 │                │          ││
│   │   ┌────┴────┐       ┌────┴────┐       ┌────┴────┐      ┌────┴────┐    ││
│   │   │ Prisma  │       │  Rate   │       │  Image  │      │ Checkout│    ││
│   │   │  ORM    │       │ Limiter │       │ Upload  │      │ Session │    ││
│   │   └─────────┘       └─────────┘       └─────────┘      └─────────┘    ││
│   │                                                                         ││
│   └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│   MONITORING: Sentry (errors) │ Vercel Analytics (performance)              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Supabase account)
- Stripe account
- AWS account (for S3)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

### Production Deployment

```bash
# Run pre-deploy checks
npm run typecheck
npm test

# Deploy to Vercel
vercel --prod
```

---

## Service Configuration

### 1. Database (PostgreSQL)

**Recommended: Supabase or PlanetScale**

```env
# Supabase with connection pooling
DATABASE_URL="postgres://[user]:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true"

# Direct connection for migrations
DIRECT_DATABASE_URL="postgres://[user]:[password]@db.[project].supabase.co:5432/postgres"
```

**Connection Settings:**
- Connection limit: 10 (adjust based on serverless concurrency)
- Prepared statements: Disable for pooled connections
- SSL: Required for production

**Migrations:**
```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:prod
```

### 2. Redis (Rate Limiting & Cache)

**Recommended: Upstash**

```env
REDIS_URL="rediss://default:[token]@[endpoint].upstash.io:6379"
```

**Features Used:**
- Rate limiting (distributed across instances)
- Session cache
- Hot data cache (popular products)

**Fallback:** In-memory rate limiting if Redis unavailable.

### 3. File Storage (S3 + CloudFront)

**S3 Bucket Configuration:**
```json
{
  "CORSConfiguration": {
    "CORSRules": [
      {
        "AllowedOrigins": ["https://covet.app"],
        "AllowedMethods": ["GET", "PUT"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3600
      }
    ]
  }
}
```

**CloudFront Settings:**
- Origin: S3 bucket
- Cache behavior: 1 year for images
- Signed URLs: For private uploads

### 4. Payments (Stripe)

**Required Products:**
- Checkout Sessions
- Connect (seller payouts)
- Webhooks

**Webhook Events to Subscribe:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`
- `payout.paid`

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 5. Email (Resend)

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Covet <noreply@covet.app>"
```

**Email Templates:**
- Order confirmation
- Shipping notification
- Dispute opened
- Seller payout
- Price drop alert

---

## Monitoring & Observability

### Health Checks

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Basic health | `{"status": "ok"}` |
| `/api/health/detailed` | Full dependency check | All services status |
| `/api/health/detailed?verbose=true` | + Memory usage | Includes heap stats |

### Logging

```typescript
import { logger } from '@/lib/logger';

// Structured logging
logger.info('Order created', { orderId, userId, amount });

// Error logging with context
logger.error('Payment failed', error, { orderId });

// Request-scoped logging
const log = createRequestLogger(request);
log.info('Processing request');
```

**Log Levels:**
- `error`: Exceptions, failures
- `warn`: Degraded performance, retries
- `info`: Business events, API calls
- `debug`: Detailed debugging (dev only)

### Sentry Integration

```env
SENTRY_DSN="https://...@sentry.io/..."
```

**Captures:**
- Unhandled exceptions
- API errors (4xx, 5xx)
- Performance traces
- Release tracking

---

## CI/CD Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PR Open   │────►│   Quality   │────►│    Build    │────►│   Preview   │
│             │     │   Checks    │     │   Verify    │     │   Deploy    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Security   │
                    │    Scan     │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Merge to    │────►│   Staging   │────►│   Health    │
│  develop    │     │   Deploy    │     │    Check    │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Release   │────►│  Migrate    │────►│ Production  │────►│   Notify    │
│    Tag      │     │     DB      │     │   Deploy    │     │   Team      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `STAGING_DATABASE_URL` | Staging PostgreSQL URL |
| `PRODUCTION_DATABASE_URL` | Production PostgreSQL URL |
| `SENTRY_AUTH_TOKEN` | Sentry release tracking |
| `SLACK_WEBHOOK_URL` | Deployment notifications |

---

## Scaling Considerations

### Database

| Users | Connections | Read Replicas | Notes |
|-------|-------------|---------------|-------|
| 1K | 10 | 0 | Single instance sufficient |
| 10K | 25 | 1 | Add read replica for search |
| 100K | 50 | 2 | Connection pooling critical |
| 1M | 100 | 3+ | Consider sharding by store |

### Redis

| Users | Memory | Notes |
|-------|--------|-------|
| 1K | 100MB | Free tier works |
| 10K | 500MB | Pro tier |
| 100K+ | 2GB+ | Enterprise tier |

### Edge Functions

Vercel automatically scales edge functions. Monitor:
- Function duration (target: <500ms p99)
- Cold starts (minimize with warming)
- Memory usage (256MB default)

---

## Security Checklist

- [ ] All secrets in environment variables (never in code)
- [ ] HTTPS enforced everywhere
- [ ] CORS configured for production domain only
- [ ] Rate limiting on all public endpoints
- [ ] Input validation on all API routes
- [ ] SQL injection protection (Prisma parameterized queries)
- [ ] XSS protection (React auto-escaping + CSP)
- [ ] CSRF tokens on form submissions
- [ ] Signed URLs for file uploads
- [ ] Webhook signature verification

---

## Disaster Recovery

### Database Backups

**Supabase:** Automatic daily backups, 7-day retention (Pro+)

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Rollback Procedure

1. Identify failing release in Vercel
2. Rollback to previous deployment: `vercel rollback [deployment-url]`
3. If database migration issue:
   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```
4. Notify team via Slack

---

## Cost Optimization

| Service | Optimization | Savings |
|---------|--------------|---------|
| Vercel | Use ISR for product pages | 30-50% bandwidth |
| S3 | Lifecycle policy for old images | 20-30% storage |
| PostgreSQL | Right-size instance | Variable |
| Redis | Use TTLs aggressively | 40-60% memory |

---

## Support Contacts

| Service | Support |
|---------|---------|
| Vercel | support@vercel.com |
| Supabase | support@supabase.io |
| Stripe | dashboard → Help |
| Upstash | support@upstash.com |
