# GETON Kenya — Kiro Deployment Guide

## What is Kiro?
Kiro is an autonomous AI development environment that:
- Sets up your project from any repo
- Provisions databases, hosting, and secrets
- Manages CI/CD automatically
- Deploys with one command

## Pre-Transfer Checklist

Before transferring the project to Kiro, make sure:

- [ ] Code is pushed to GitHub (private repo recommended)
- [ ] Supabase project is created and you have the connection string
- [ ] Paystack account is created (sandbox keys ready)
- [ ] Render account is created (free tier works)
- [ ] Vercel account is created (Hobby/free tier)
- [ ] All `.env` values are documented in `.env.example` (DO NOT commit secrets)

---

## Step 1: Prepare the Codebase for Kiro

### 1.1 Verify build works

```bash
# From project root
npm install
npm run build
# Should output: dist/index.html  535 kB  ✓ built in ~2s
```

### 1.2 Verify backend is clean

```bash
cd backend
npm install
npm run build
# Should compile without errors
```

### 1.3 Push to GitHub

```bash
# Initialize git if not already
git init
git add .
git commit -m "GETON Kenya v1.0 — production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/geton-kenya.git
git push -u origin main
```

### 1.4 What Kiro needs to know (paste this into Kiro's first message)

```
Project: GETON Kenya — Fintech loan app for M-Pesa loans in Kenya

Stack:
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Prisma ORM
- Database: Supabase (PostgreSQL)
- Hosting: Vercel (frontend) + Render (backend)
- Payments: Paystack (M-Pesa STK Push + B2C)
- SMS: Africa's Talking

Key commands:
- Frontend dev: npm run dev
- Backend dev: cd backend && npm run dev
- Frontend build: npm run build
- Backend build: cd backend && npm run build
- Database setup: cd backend && npm run db:push

Environment variables (place in .env files, NEVER commit):
Frontend (.env.local):
- VITE_API_URL=your-backend-url
- VITE_SITE_URL=your-frontend-url

Backend (backend/.env):
- DATABASE_URL=postgresql://...your-supabase-url...
- JWT_SECRET=<64-byte-random-hex>
- PAYSTACK_SECRET_KEY=sk_test_...
- PAYSTACK_PUBLIC_KEY=pk_test_...
- PAYSTACK_WEBHOOK_SECRET=<from-paystack-dashboard>
- AT_API_KEY=<africas-talking-key>
- FRONTEND_URL=<your-frontend-url>
- API_URL=<your-backend-url>
```

---

## Step 2: Set Up the Infrastructure in Kiro

In Kiro, tell it:

> "Set up the following infrastructure for the GETON Kenya project:
> 1. Create a Supabase project named 'geton-kenya' in the Singapore region
> 2. Create a Render web service named 'geton-api' using the backend folder, Node 20, Starter plan, Singapore region
> 3. Create a Vercel project for the frontend
> 4. Set up the Paystack webhook to point to https://geton-api.onrender.com/api/v1/webhooks/paystack"

Kiro will guide you through each step.

---

## Step 3: Configure Supabase

### Option A: Let Kiro do it

> "Create a Supabase project, run the Prisma migration, and return the connection string."

### Option B: Manual

1. Go to https://supabase.com/dashboard → New Project
2. Name: `geton-kenya`, Region: **Singapore**, save password
3. Project Settings → Database → copy **Transaction pooler** URL
4. Add to `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```
5. From your local machine, run:
   ```bash
   cd backend
   npm install
   npx prisma db push
   ```

---

## Step 4: Deploy Backend to Render (via Kiro)

> "Deploy the backend to Render. Set up all environment variables from .env.example. Use the Supabase DATABASE_URL. After deploy, set up the Paystack webhook URL to https://geton-api.onrender.com/api/v1/webhooks/paystack and copy the webhook secret back to the PAYSTACK_WEBHOOK_SECRET env var."

Kiro will:
1. Connect to your Render account
2. Create a Web Service pointing to `backend/`
3. Set up all env vars from `.env.example`
4. Trigger first deploy
5. Wait for the health check to pass
6. Configure the Paystack webhook

---

## Step 5: Deploy Frontend to Vercel (via Kiro)

> "Deploy the frontend to Vercel. Set the VITE_API_URL to https://geton-api.onrender.com/api/v1."

Kiro will:
1. Connect to Vercel
2. Import the repo
3. Detect Vite from `vercel.json`
4. Set env vars
5. Deploy to global edge

---

## Step 6: Verify End-to-End (via Kiro)

> "Run an end-to-end test:
> 1. Check https://geton-kenya.vercel.app/ loads
> 2. Register a test user
> 3. Apply for a KSh 10,000 loan
> 4. Verify activation fee is KSh 799
> 5. Check the backend logs for the M-Pesa STK push being sent
> 6. Verify the webhook is configured in Paystack
> 7. Report any issues found"

Kiro will run these tests and report back.

---

## Step 7: Production Hardening (via Kiro)

> "Set up the following for production:
> 1. Add a custom domain geton.co.ke to both Vercel and Render
> 2. Enable Supabase PITR (point-in-time recovery) on the Pro plan
> 3. Set up UptimeRobot to monitor both endpoints every 5 minutes
> 4. Configure Paystack LIVE keys (sk_live_, pk_live_)
> 5. Update the Paystack webhook to use the production domain
> 6. Add Sentry for error tracking
> 7. Set up daily database backups via Supabase's backup API"

---

## Common Kiro Prompts

### "Set up environment variables"
> "Create a .env file in backend/ with the following structure from .env.example, but fill in these values: [paste your values]. Then set the same env vars on Render."

### "Run integration tests"
> "Run the payment integration tests (npm run test:payment) and tell me if everything passes. If any test fails, explain why and how to fix it."

### "Verify the deployment is working"
> "Curl https://geton-api.onrender.com/api/health and verify the response. Then curl https://geton-kenya.vercel.app/ and verify it loads. Report any issues."

### "Add monitoring"
> "Set up Sentry for both frontend and backend. Use the Sentry DSN I'll provide. Make sure to:
> 1. Capture all unhandled errors
> 2. Set sample rate to 10% in production
> 3. Tag errors with user_id when available
> 4. Don't capture PII"

### "Test the payment flow"
> "Use Paystack sandbox to test a real M-Pesa STK Push:
> 1. Create a test user
> 2. Apply for a KSh 5,000 loan
> 3. Initiate payment with phone 254708374149 (Paystack test number)
> 4. Use Paystack's 'Send test event' button to fire a test webhook
> 5. Verify the loan is marked as paid in the database
> 6. Report any issues"

---

## Kiro Configuration Files (auto-generated)

Kiro will create a `.kiro/` folder with:

```
.kiro/
├── config.json           # Project config
├── environments/
│   ├── development.json  # Dev env vars
│   ├── staging.json      # Staging env vars
│   └── production.json   # Production env vars
├── deploy/
│   ├── vercel.json       # Vercel deploy config
│   ├── render.json       # Render deploy config
│   └── supabase.json     # Supabase migration config
└── README.md             # Kiro-specific docs
```

---

## Health Check URLs

After deployment, monitor these endpoints:

| Endpoint | URL | Expected |
|---|---|---|
| Frontend | `https://geton-kenya.vercel.app/` | 200 OK |
| Frontend custom | `https://geton.co.ke/` | 200 OK |
| Backend health | `https://geton-api.onrender.com/api/health` | `{"status":"ok"}` |
| API custom | `https://api.geton.co.ke/api/health` | `{"status":"ok"}` |
| Paystack webhook | `https://api.geton.co.ke/api/v1/webhooks/paystack` | Returns 200/401/400 (not 404) |

---

## Emergency Rollback

If something goes wrong in production:

> "Kiro, I need to rollback to the previous deploy. Show me how to do it on both Vercel and Render, and also how to restore the database backup from Supabase if needed."

Kiro will:
1. Show the previous deploy on Render (rollback URL)
2. Show the previous deploy on Vercel (promote to production)
3. Show the Supabase backup restore command

---

## Cost Summary (Kiro-managed)

| Service | Tier | Monthly Cost | Managed by Kiro |
|---|---|---|---|
| Vercel | Hobby | $0 | ✅ |
| Render | Starter | $7 | ✅ |
| Supabase | Free → Pro $25 | $0-25 | ✅ |
| Paystack | Pay-as-you-go | 1.95%/txn | Manual setup |
| Africa's Talking | Pay-as-you-go | ~KSh 0.80/SMS | Manual setup |
| Sentry | Free tier | $0 | ✅ |
| UptimeRobot | Free tier | $0 | ✅ |
| **Total** | | **~$7-32/mo** | |

---

## Kiro vs. Manual Deployment

| Task | Manual | Kiro |
|---|---|---|
| Setup Supabase | 10 min | 2 min |
| Deploy backend to Render | 15 min | 5 min |
| Deploy frontend to Vercel | 5 min | 2 min |
| Configure env vars | 10 min | 1 min |
| Setup Paystack webhook | 5 min | 1 min |
| Setup custom domain | 10 min | 3 min |
| Setup monitoring | 15 min | 3 min |
| **Total** | **~70 min** | **~17 min** |

---

## First Conversation with Kiro

Paste this into your first Kiro message:

```
I'm deploying the GETON Kenya project to production. Please:

1. Clone my repo from https://github.com/YOUR_USERNAME/geton-kenya
2. Review the project structure (frontend in /, backend in /backend)
3. Set up the following infrastructure:
   - Supabase project (Singapore region, named 'geton-kenya')
   - Render web service for backend (Node 20, Starter, Singapore)
   - Vercel project for frontend
4. Configure environment variables on each service from .env.example files
5. Deploy both and verify health checks pass
6. Set up the Paystack webhook pointing to the backend URL
7. Report back the production URLs and any issues

I will provide the secrets (Paystack keys, JWT secret, etc.) when asked.
```

---

## Support

If Kiro gets stuck:

1. **Check the logs** — Render and Vercel both have great log views
2. **Use Kiro's debug command** — it can inspect running services
3. **Check our docs** — `README.md`, `DEPLOYMENT.md`, `PAYMENT_TROUBLESHOOTING.md`
4. **Run tests** — `npm run test:payment` from backend

---

## 🎉 You're ready to deploy!

The project is clean, well-documented, and Kiro-ready. Just follow the steps above and you'll be live in production in about 20 minutes.
