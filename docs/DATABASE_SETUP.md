# Covet Database Setup Guide

## Current State: In-Memory Database

The application currently uses an in-memory database for development/demo purposes.
**⚠️ All data is lost when the server restarts!**

## Migrating to PostgreSQL (Production)

### Prerequisites
- PostgreSQL 14+ database (Neon, Supabase, Railway, or self-hosted)
- Node.js 18+

### Step 1: Get a PostgreSQL Database

**Recommended providers:**
- **Neon** (serverless, free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free trial): https://railway.app
- **PlanetScale** (MySQL alternative): https://planetscale.com

### Step 2: Configure Environment

Create/update `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/covet?sslmode=require"
USE_PRISMA=true

# Auth (REQUIRED for production)
JWT_SECRET="your-secure-random-string-at-least-32-characters-long"

# Optional: Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Push Schema to Database

**For development (creates tables, may lose data):**
```bash
npx prisma db push
```

**For production (creates migration files):**
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### Step 5: Seed the Database

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@covet.com` / `Admin123!`
- Store admin: `store@covet.com` / `Store123!`
- Test buyer: `buyer@test.com` / `Buyer123!`
- Covet Boston flagship store
- 8 sample luxury products

### Step 6: Verify Connection

```bash
npx prisma studio
```

This opens a web UI to browse your database.

### Step 7: Build for Production

```bash
npm run build:prod
```

## Database Schema

The Prisma schema is in `prisma/schema.prisma`. Key models:

| Model | Description |
|-------|-------------|
| User | Buyers, store admins, platform admins |
| Store | Seller storefronts |
| Product | Luxury items for sale |
| Order | Purchase transactions |
| Review | Buyer reviews |
| Dispute | Order disputes |
| StoreApplication | Seller applications |

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:migrate` | Create migration (dev) |
| `npm run db:migrate:prod` | Deploy migrations (prod) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database (WARNING: deletes all data) |

## Switching Between Backends

The application automatically uses the in-memory database unless:
1. `DATABASE_URL` is set
2. `USE_PRISMA=true` is set

To force in-memory mode, simply unset `USE_PRISMA` or set it to `false`.

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `JWT_SECRET` (32+ chars, cryptographically random)
- [ ] Set `DATABASE_URL` to production database
- [ ] Set `USE_PRISMA=true`
- [ ] Run `npx prisma migrate deploy`
- [ ] Configure Stripe keys
- [ ] Set up backup schedule for database
- [ ] Configure connection pooling (e.g., PgBouncer)

## Troubleshooting

### "PrismaClient not found"
Run `npx prisma generate` to create the client.

### Connection timeout
Check your DATABASE_URL and ensure the database accepts connections from your IP.

### "Table does not exist"
Run `npx prisma db push` or `npx prisma migrate deploy`.

### Schema drift
Run `npx prisma db pull` to sync your schema with the database.
