# GETON Kenya — Backend API

Production-ready Node.js + TypeScript backend for the GETON Kenya fintech app.

## 🎯 What This Does

- **Auth:** JWT-based registration, login, refresh tokens, password reset, PIN, phone OTP
- **KYC:** National ID, M-Pesa linking, KRA PIN verification (3 tiers → KSh 50K / 150K / 250K)
- **Loans:** Apply, calculate terms, activate, disburse, repay (all with proper state machine)
- **Payments:** **Paystack M-Pesa STK Push** (the only payment method)
  - Activation fee: customer receives M-Pesa prompt on their phone
  - Loan disbursement: B2C transfer from GETON to customer's M-Pesa
  - Loan repayment: customer receives M-Pesa prompt to pay
  - Webhook handler verifies signature & updates state
- **Wallet:** Deposit (STK), Withdraw (B2C), balance
- **Notifications:** In-app + SMS (Africa's Talking)
- **Audit log:** Every sensitive action logged for compliance
- **Security:** Helmet, CORS, rate limiting, bcrypt, input validation, HMAC signature verification
- **Observability:** Pino structured logging, health check, graceful shutdown

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma     # Database schema (User, KYC, Loan, PaymentIntent, etc)
│   └── seed.ts           # Demo data seeder
├── src/
│   ├── config.ts         # Env configuration
│   ├── db.ts              # Prisma client
│   ├── logger.ts          # Pino structured logger
│   ├── errors.ts          # HTTP error classes + handler
│   ├── types.ts           # Shared TypeScript types
│   ├── utils.ts           # Phone format, validation, loan calc
│   ├── server.ts          # Express app entry point
│   ├── middleware/
│   │   ├── auth.ts        # JWT sign/verify, requireAuth, requireRole
│   │   ├── validate.ts    # Zod validation middleware
│   │   └── audit.ts       # Audit log middleware
│   ├── services/
│   │   ├── paystack.ts    # Paystack API wrapper (STK Push + B2C + webhook verify)
│   │   ├── sms.ts         # Africa's Talking SMS
│   │   └── notifications.ts # In-app notifications
│   ├── controllers/
│   │   ├── auth.ts        # Register, login, refresh, password, PIN, OTP
│   │   ├── payments.ts    # STK push initiate, verify, webhook handler
│   │   ├── loans.ts       # Apply, list, get, disburse, repay, cancel
│   │   ├── kyc.ts         # Submit, upload, get
│   │   ├── user.ts        # Profile, devices, stats
│   │   ├── wallet.ts      # Deposit, withdraw
│   │   ├── transactions.ts # History
│   │   ├── notifications.ts # List, mark read
│   │   └── referral.ts    # Code generation, stats
│   └── routes/
│       ├── index.ts       # Mounts all routes
│       ├── auth.ts        # /api/v1/auth/*
│       ├── loans.ts       # /api/v1/loans/*
│       ├── payments.ts    # /api/v1/payments/*
│       ├── kyc.ts         # /api/v1/kyc/*
│       ├── users.ts       # /api/v1/users/*
│       ├── wallet.ts      # /api/v1/wallet/*
│       ├── transactions.ts # /api/v1/transactions/*
│       ├── notifications.ts # /api/v1/notifications/*
│       ├── referral.ts    # /api/v1/referrals/*
│       └── webhooks.ts    # /api/v1/webhooks/paystack
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your real keys
```

**Required for payments to work:**
- `PAYSTACK_SECRET_KEY` — get from https://dashboard.paystack.com/#/settings/developers
- `PAYSTACK_WEBHOOK_SECRET` — set in Paystack dashboard, same value in .env

**Required for SMS (optional in dev):**
- `AT_API_KEY` — Africa's Talking API key

### 3. Set up the database

**Option A: SQLite (simplest, for local dev)**

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Create tables in SQLite (dev.db)
npm run db:seed       # Optional: load demo data
```

**Option B: PostgreSQL (for production)**

```bash
# Edit .env and set:
DATABASE_URL="postgresql://user:pass@host:5432/geton"

# In prisma/schema.prisma, change provider to:
# provider = "postgresql"

# Then:
npx prisma migrate dev --name init
npx prisma migrate deploy   # In production
```

**Or use Docker (easiest):**
```bash
docker-compose up -d
# PostgreSQL + API auto-configured
```

### 4. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

For first-time setup, you can run everything at once:
```bash
npm run setup
# = npm install + db:generate + db:push + db:seed
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+254712345678",
    "password": "Test1234!"
  }'
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on port 5432
- **API** on port 3000 (with auto-restart)

To deploy on a server (DigitalOcean, AWS, etc.):

```bash
# On server
git clone <repo>
cd backend
cp .env.example .env  # edit with real keys
docker-compose up -d
```

## 💳 Paystack M-Pesa Setup

1. Sign up at https://paystack.com
2. Go to Settings → API Keys & Webhooks
3. Copy your **Secret Key** to `PAYSTACK_SECRET_KEY` in `.env`
4. Go to Settings → Webhooks
5. Set webhook URL to: `https://your-api.com/api/v1/webhooks/paystack`
6. Copy the webhook secret to `PAYSTACK_WEBHOOK_SECRET` in `.env`
7. Subscribe to events: `charge.success`, `charge.failed`, `transfer.success`, `transfer.failed`, `transfer.reversed`
8. For M-Pesa, enable **Mobile Money** in your Paystack account (contact support)

### How M-Pesa STK Push works

```
1. Customer clicks "Pay" in app
       ↓
2. Backend creates PaymentIntent + calls Paystack /charge
   with { mobile_money: { phone, provider: "mpesa" } }
       ↓
3. Paystack → Safaricom Daraja API → M-Pesa prompt on phone
       ↓
4. Customer enters M-Pesa PIN
       ↓
5. Safaricom → Paystack → webhook → our /api/v1/webhooks/paystack
       ↓
6. We verify HMAC-SHA512 signature
       ↓
7. If charge.success → mark loan as paid & auto-disburse via B2C
       ↓
8. Customer receives loan in M-Pesa + SMS notification
```

## 🔌 API Reference

### Auth

- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Revoke refresh token
- `POST /api/v1/auth/forgot-password` — Send OTP to phone
- `POST /api/v1/auth/reset-password` — Reset with OTP
- `POST /api/v1/auth/change-password` — Change (auth required)
- `POST /api/v1/auth/pin` — Set transaction PIN
- `POST /api/v1/auth/phone/send-otp` — Send phone verification OTP
- `POST /api/v1/auth/phone/verify` — Verify phone with OTP

### User

- `GET /api/v1/users/me` — Current user profile
- `PATCH /api/v1/users/me` — Update profile
- `GET /api/v1/users/me/stats` — User statistics
- `GET /api/v1/users/me/devices` — List logged-in devices
- `DELETE /api/v1/users/me/devices/:id` — Revoke device

### Loans

- `POST /api/v1/loans/calculate` — Compute terms (no auth)
- `POST /api/v1/loans/apply` — Apply for a loan
- `GET /api/v1/loans` — List my loans
- `GET /api/v1/loans/:id` — Get specific loan
- `POST /api/v1/loans/:id/disburse` — Trigger B2C disbursement
- `POST /api/v1/loans/:id/repay` — Initiate repayment STK push
- `POST /api/v1/loans/:id/cancel` — Cancel pending loan

### Payments

- `POST /api/v1/payments/activation` — Initiate activation fee STK push
- `POST /api/v1/payments/verify` — Poll/check payment status
- `POST /api/v1/webhooks/paystack` — **Paystack webhook (HMAC verified)**

### KYC

- `GET /api/v1/kyc` — Get KYC status
- `POST /api/v1/kyc` — Submit KYC info
- `POST /api/v1/kyc/upload` — Upload document (ID, selfie, address)

### Wallet

- `GET /api/v1/wallet` — Get balance
- `POST /api/v1/wallet/deposit` — STK push deposit
- `POST /api/v1/wallet/withdraw` — B2C withdrawal to M-Pesa

### Transactions

- `GET /api/v1/transactions?type=...&limit=50&cursor=...` — History
- `GET /api/v1/transactions/:id` — Single transaction

### Notifications

- `GET /api/v1/notifications?unreadOnly=true` — List
- `POST /api/v1/notifications/:id/read` — Mark one read
- `POST /api/v1/notifications/read-all` — Mark all read

### Referrals

- `GET /api/v1/referrals` — Get code + stats

## 🛡️ Security

- **Passwords:** bcrypt with 12 rounds
- **JWT:** HS256, 7-day access tokens, 30-day refresh tokens
- **PINs:** bcrypt-hashed 4-digit
- **Rate limiting:** 20 req/15min for auth, 300 req/15min for API
- **CORS:** Whitelisted origins
- **Helmet:** Security headers
- **Webhook verification:** HMAC-SHA512 with timing-safe comparison
- **SQL injection:** Protected by Prisma's parameterization
- **XSS:** Content-Type: application/json; input validation with Zod
- **Audit log:** Every sensitive action logged
- **Idempotency:** Webhook handlers are idempotent
- **Refresh token rotation:** Old tokens revoked on refresh

## 📊 Database Schema

- **User** — account, KYC level, wallet, credit score
- **KYC** — National ID, M-Pesa, KRA PIN
- **Loan** — amount, terms, status (pending → fees-required → approved → active → repaid)
- **ActivationFee** — broken down by type (processing, insurance, verification)
- **LoanPayment** — repayment history
- **PaymentIntent** — STK push tracking
- **Transaction** — universal transaction log
- **Notification** — in-app messages
- **Device** — logged-in devices
- **RefreshToken** — JWT refresh tokens
- **AuditLog** — security & compliance
- **WebhookEvent** — incoming webhooks (for retry/audit)

## 🧪 Testing the Payment Flow

1. Use Paystack test mode (test keys start with `sk_test_`)
2. For M-Pesa sandbox, use test phone number `254708374149`
3. When STK push is sent, Paystack auto-confirms in test mode
4. Webhook will fire `charge.success` instantly
5. Check your logs and database to see the loan transition

## 📜 License

Proprietary — GETON Financial Services Ltd.

## 🆘 Support

For issues:
- Check `/api/health` first
- Review logs: `docker logs geton-api` or `npm run dev`
- Test Paystack in sandbox: https://dashboard.paystack.com/#/test
- Test M-Pesa via Paystack test numbers
