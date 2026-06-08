# GETON Kenya — Instant Loans on M-Pesa

> Borrow KSh 2,500 to KSh 250,000 sent directly to your M-Pesa. CBK licensed.

This repository contains:

- **`/` (root)** — Frontend: React + Vite + TailwindCSS + TypeScript
- **`/backend`** — Backend: Node.js + Express + Prisma + TypeScript
- **`/backend/prisma/schema.prisma`** — Database schema (SQLite for dev, PostgreSQL for prod)
- **`/public`** — Static assets (logo, OG image, PWA manifest, robots.txt, sitemap.xml)

## 🚀 Quick Start

### Frontend (Vite + React)

```bash
npm install
cp .env.example .env.local       # Configure API URL
npm run dev                       # http://localhost:5173
```

### Backend (Node.js + Express + Prisma)

```bash
cd backend
npm install
cp .env.example .env              # Add Paystack keys (PAYSTACK_SECRET_KEY required)

# Generate Prisma client + create database tables
npm run db:generate
npm run db:push
npm run db:seed                   # Optional: load demo data

npm run dev                       # http://localhost:3000
```

> 📖 **Database setup guide:** [backend/prisma/SETUP.md](backend/prisma/SETUP.md)
>
> - For development: SQLite (`backend/dev.db` auto-created)
> - For production: PostgreSQL via Docker Compose (auto-configured)

### Full Stack (Docker)

```bash
cd backend
docker-compose up -d              # Starts API + PostgreSQL
```

## 🏗️ Architecture

```
┌──────────────────┐   HTTPS/REST    ┌──────────────────┐   PostgreSQL    ┌────────────┐
│  Vercel (React)  │ ────────────────►│  Render (Express) │ ◄─────────────► │  Supabase  │
│  GETON Frontend  │ ◄────────────────│  GETON API         │                  │  Database  │
│  (Vite, RWD)     │   JSON + JWT    │  (Node + Prisma)   │                  │  (PG)      │
└──────────────────┘                  └──────────────────┘                  └────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Paystack    │
                                       │  M-Pesa API  │
                                       │  (Daraja)    │
                                       └──────────────┘
```

**Deployment stack** (for production):
- ✅ **Frontend:** Vercel (free Hobby tier)
- ✅ **Backend:** Render ($7/mo Starter)
- ✅ **Database:** Supabase (Pro $25/mo, free tier to start)
- ✅ **Payments:** Paystack (live, pay-per-transaction)
- ✅ **SMS:** Africa's Talking (pay-per-SMS)

📖 **Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

## 💳 Payment Flow (Paystack M-Pesa STK Push)

```
1. Customer clicks "Pay KSh 299" in app
       ↓
2. Frontend calls POST /api/v1/payments/activation
       ↓
3. Backend creates PaymentIntent, calls Paystack /charge
   with { mobile_money: { phone, provider: "mpesa" } }
       ↓
4. Paystack → Safaricom Daraja API → M-Pesa prompt on phone
       ↓
5. Customer enters M-Pesa PIN
       ↓
6. Safaricom → Paystack → webhook → our /api/v1/webhooks/paystack
       ↓
7. We verify HMAC-SHA512 signature
       ↓
8. If charge.success → mark loan as paid & auto-disburse via B2C transfer
       ↓
9. Customer receives loan in M-Pesa + SMS notification
```

## 📚 Documentation

- **Frontend architecture:** See `src/` directory
- **Backend API reference:** See [backend/README.md](backend/README.md)
- **Database schema:** See [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- **Loan terms & fees:** Configured in `backend/src/config.ts`

## 🔑 Key Features

- **One-time activation fee** (KSh 299 min — KSh 4,999 max) — paid via M-Pesa STK Push
- **6% monthly interest** (72% APR) — competitive vs. industry 12-20%
- **Loan range:** KSh 2,500 – KSh 250,000
- **Tenure:** 1–12 months
- **KYC tiers:** 1 (KSh 50K) → 2 (KSh 150K) → 3 (KSh 250K)
- **Boost credit score** by repaying on time (+50 points per completed loan)
- **M-Pesa B2C disbursement** — funds sent directly to customer's M-Pesa
- **Webhook-driven** — state changes happen server-side via Paystack webhooks
- **Audit log** — every sensitive action recorded for compliance
- **Idempotent** — webhook handlers can be called multiple times safely

## 🌐 Deployment

- **Frontend:** Vercel, Netlify, Cloudflare Pages (static)
- **Backend:** Railway, Render, Fly.io, DigitalOcean App Platform
- **Database:** Supabase, Neon, Railway Postgres, or self-hosted PostgreSQL

See [backend/README.md](backend/README.md) for the full deployment guide.

## 📜 License

Proprietary — © 2026 GETON Financial Services Ltd. — Licensed by CBK.
