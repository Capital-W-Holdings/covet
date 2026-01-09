# Covet Cron Jobs

## Overview

Covet uses scheduled cron jobs for automated platform maintenance. These run on Vercel Cron (configured in `vercel.json`) or can be triggered manually.

## Available Jobs

| Job | Schedule | Endpoint | Purpose |
|-----|----------|----------|---------|
| Cleanup Reservations | Every 15 minutes | `/api/cron/cleanup-reservations` | Release expired product reservations |
| Process Payouts | Daily at 6 AM UTC | `/api/cron/process-payouts` | Process seller payouts after hold period |
| Send Price Alerts | Every 4 hours | `/api/cron/send-price-alerts` | Notify users of price drops |

## Configuration

### Environment Variables

```env
# Required for production
CRON_SECRET=your-secure-cron-secret-min-32-chars
```

### Vercel Configuration

Cron schedules are defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-reservations",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/send-price-alerts",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

## Security

All cron endpoints require authorization:

| Method | Header | Value |
|--------|--------|-------|
| Bearer Token | `Authorization` | `Bearer {CRON_SECRET}` |
| Vercel Cron | `x-vercel-cron-signature` | Auto-signed by Vercel |

**Development Mode**: Authorization is bypassed when `NODE_ENV=development`

## Response Format

All cron jobs return a consistent response:

```typescript
interface CronResult {
  success: boolean;      // Overall success
  processed: number;     // Items processed
  errors: number;        // Errors encountered
  duration: number;      // Execution time (ms)
  details?: {            // Job-specific details
    // Varies by job
  };
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Complete success |
| 207 | Partial success (some errors) |
| 401 | Unauthorized |
| 500 | Job failed |

---

## Job Details

### 1. Cleanup Reservations

**Purpose**: Release products that were reserved during checkout but never purchased.

**When products are reserved**:
- User adds to cart and begins checkout
- Product marked `RESERVED` for 30 minutes
- Prevents overselling during payment

**What this job does**:
1. Finds products with `reservedUntil < now` and `reservedBy != null`
2. Sets `reservedBy = null`, `reservedUntil = null`
3. Changes status back to `ACTIVE`

**Example Response**:
```json
{
  "success": true,
  "processed": 3,
  "errors": 0,
  "duration": 145,
  "details": {
    "expiredReservations": ["SKU001", "SKU002", "SKU003"],
    "timestamp": "2025-01-08T15:00:00Z"
  }
}
```

---

### 2. Process Payouts

**Purpose**: Transfer funds to sellers after the dispute hold period.

**Payout Hold Period**: 7 days after delivery

**Eligibility Criteria**:
- Order status = `DELIVERED`
- Delivered > 7 days ago
- No open disputes
- Not already paid out

**What this job does**:
1. Finds eligible orders grouped by store
2. Calculates net payout (total - platform fee)
3. Creates Stripe transfer (production) or logs (demo mode)
4. Records `StorePayout` entry

**Fee Structure**:
- Flagship stores: 6% platform fee
- Premium partners: 8% platform fee
- Standard partners: 10% platform fee

**Example Response**:
```json
{
  "success": true,
  "processed": 5,
  "errors": 0,
  "duration": 2340,
  "details": {
    "totalPayoutAmount": 4523.50,
    "holdPeriodDays": 7,
    "cutoffDate": "2025-01-01T06:00:00Z",
    "payouts": [
      { "storeId": "store-1", "orders": 12, "amount": 2150.00, "status": "success" },
      { "storeId": "store-2", "orders": 8, "amount": 1890.50, "status": "success" },
      { "storeId": "store-3", "orders": 3, "amount": 483.00, "status": "success" }
    ],
    "isDemo": false
  }
}
```

---

### 3. Send Price Alerts

**Purpose**: Notify users when products they're watching drop in price.

**How users set alerts**:
- View product page
- Click "Set Price Alert"
- Enter target price

**What this job does**:
1. Finds alerts where `currentPrice <= targetPrice` and not yet notified
2. Sends email notification to user
3. Marks alert as notified

**Example Response**:
```json
{
  "success": true,
  "processed": 12,
  "errors": 0,
  "duration": 890,
  "details": {
    "alertsSent": [
      { "productSku": "LV-001", "userEmail": "j***n@example.com", "oldPrice": 2500, "newPrice": 2100 },
      { "productSku": "CH-045", "userEmail": "s***a@example.com", "oldPrice": 1800, "newPrice": 1650 }
    ],
    "checkTime": "2025-01-08T16:00:00Z"
  }
}
```

---

## Manual Execution

### Via cURL

```bash
# Development (no auth required)
curl http://localhost:3000/api/cron/cleanup-reservations

# Production (with auth)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://covet.app/api/cron/cleanup-reservations
```

### Via Admin Dashboard

1. Navigate to Admin → System → Cron Jobs
2. Click "Run Now" next to the job
3. View execution results

---

## Monitoring

### Logs

All cron jobs log to the structured logger:

```
INFO  Cron job started: cleanup-reservations
INFO  Released expired reservation { productId: "...", sku: "LV-001" }
INFO  Cron job completed: cleanup-reservations { processed: 3, errors: 0, duration: 145 }
```

### Alerting

Configure alerts in your monitoring system for:
- Cron job failures (`success: false`)
- High error rates (`errors > 0`)
- Long execution times (`duration > 60000`)
- Missing executions (no logs for expected schedule)

### Recommended Sentry Rules

```
# Alert on cron failures
alert.when(
  event.message.contains("Cron job failed") 
  OR event.level == "error" 
  AND event.tags.category == "cron"
)
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid CRON_SECRET | Check environment variable |
| 207 Partial Success | Some items failed | Check error details in response |
| Slow execution | Large batch size | Consider pagination or batching |
| Missing executions | Vercel cron limits | Check Vercel dashboard |

### Vercel Cron Limits

| Plan | Cron Invocations/Day |
|------|---------------------|
| Hobby | 2 |
| Pro | 40 |
| Enterprise | Unlimited |

For high-frequency needs, consider external cron services (e.g., cron-job.org, EasyCron).
