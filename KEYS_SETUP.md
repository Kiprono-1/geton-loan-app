# GETON Kenya — Keys Setup Guide

## ✅ Keys Configured (Local Development)

Your keys have been integrated into `backend/.env`. Here's a summary:

| Key | Status | Source |
|---|---|---|
| `JWT_SECRET` | ✅ Set | Provided (64-byte hex) |
| `PAYSTACK_SECRET_KEY` | ✅ Set (sandbox) | Provided (`sk_test_...`) |
| `PAYSTACK_PUBLIC_KEY` | ✅ Set (sandbox) | Provided (`pk_test_...`) |
| `DATABASE_URL` | ✅ Set (Supabase) | Provided |
| `PAYSTACK_WEBHOOK_SECRET` | ⚠️ **TODO** | You need to create the webhook in Paystack |

## ⚠️ One Critical Action Required

You need to set up the **Paystack webhook** and get its secret:

### Step 1: Go to Paystack Webhooks

Visit: https://dashboard.paystack.com/#/settings/webhooks

### Step 2: Create a new webhook

1. Click **Add Webhook**
2. **Webhook URL:** `https://YOUR-BACKEND-URL.com/api/v1/webhooks/paystack`
   - For local testing with ngrok: `https://abc123.ngrok.io/api/v1/webhooks/paystack`
   - For Render: `https://geton-api.onrender.com/api/v1/webhooks/paystack`
3. **Events to subscribe to:**
   - `charge.success` ✅
   - `charge.failed` ✅
   - `charge.abandoned`
   - `transfer.success` ✅
   - `transfer.failed` ✅
   - `transfer.reversed`
4. Click **Save**
5. **Copy the Webhook Secret** (it looks like `whsec_xxxxxxxxxxxxx`)

### Step 3: Update the secret in your `.env`

Replace the placeholder in `backend/.env`:
```bash
PAYSTACK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### Step 4: For Render deployment

When you deploy to Render, set the same env var in the dashboard.

---

## 🚀 Test the Setup Locally

### 1. Install dependencies

```bash
cd backend
npm install
```

This will run `postinstall: prisma generate` automatically.

### 2. Set up the database (first time only)

```bash
npm run setup
```

This runs the setup script which:
- ✅ Verifies Node version (20+)
- ✅ Installs dependencies
- ✅ Generates Prisma client
- ✅ Pushes schema to your Supabase DB (creates 13 tables)
- ✅ Seeds demo data
- ✅ Verifies connection

### 3. Start the server

```bash
npm run dev
# → API running on http://localhost:3000
```

### 4. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@geton.co.ke",
    "phone": "+254712345678",
    "password": "Test1234!"
  }'
```

### 5. Test the payment flow

```bash
# Calculate loan terms (no auth needed)
curl -X POST http://localhost:3000/api/v1/loans/calculate \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000, "tenure": 3}'

# Should return: activationFee: 5499, interestRate: 1 (12% APR)
```

---

## 🧪 Run the Tests

```bash
npm run test:payment
```

Expected output:
```
🧪 GETON Kenya Backend — Integration Tests
================================================

🧪 Checking environment configuration…
  ✅ DATABASE_URL: OK
  ✅ JWT_SECRET: OK
  ✅ PAYSTACK_SECRET_KEY: OK
  ✅ PAYSTACK_PUBLIC_KEY: OK
  ✅ PAYSTACK_WEBHOOK_SECRET: OK
  ✅ FRONTEND_URL: OK

🧪 Testing webhook signature verification…
  ✅ Correct signature accepted: PASS
  ✅ Wrong signature rejected: PASS
  ✅ Empty signature rejected: PASS

🧪 Testing phone number formatting…
  ✅ 0712345678 → 254712345678
  ✅ +254712345678 → 254712345678
  ...

🧪 Testing activation fee tiers…
  ✅ KSh 2,500 → KSh 500
  ✅ KSh 250,000 → KSh 15,000

🧪 Testing tier-based interest rates…
  ✅ Standard customer: 1% (12% APR)
  ✅ VIP customer: 0.5% (6% APR)
  ...

✅ All tests passed!
```

---

## 🌐 Deploy with Kiro

Once local tests pass, you're ready to deploy:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "GETON Kenya v1.0 - with configured keys"
   git push
   ```

2. **Send to Kiro:**
   ```
   Deploy my GETON Kenya project to production:
   - Frontend: Vercel
   - Backend: Render
   - Database: Supabase (already configured)
   
   Use these env vars for Render:
   - DATABASE_URL=postgresql://postgres:D3MyybYVFStdcnib@db.jndninxrqwbrqfczearu.supabase.co:5432/postgres
   - JWT_SECRET=<provided>
   - PAYSTACK_SECRET_KEY=<provided>
   - PAYSTACK_PUBLIC_KEY=<provided>
   - PAYSTACK_WEBHOOK_SECRET=<get from Paystack dashboard>
   
   Tell me when deploy is done and what the URLs are.
   ```

3. **Kiro will:**
   - ✅ Connect to Render and deploy backend
   - ✅ Set all env vars
   - ✅ Connect to Vercel and deploy frontend
   - ✅ Verify health checks
   - ✅ Report the production URLs

---

## 🆘 Troubleshooting

### "Database connection failed"
- ✅ Check the password is correct: `D3MyybYVFStdcnib`
- ✅ Check the host: `db.jndninxrqwbrqfczearu.supabase.co`
- ✅ Make sure Supabase project isn't paused
- ✅ If on Render, use the **transaction pooler** URL (port 6543), not direct (port 5432)

### "Paystack error: Invalid key"
- ✅ Make sure you're using the **sandbox** keys (`sk_test_`, `pk_test_`)
- ✅ Don't add extra spaces or quotes
- ✅ Test the key at https://dashboard.paystack.com/#/test/keys

### "Webhook signature verification failed"
- ✅ The `PAYSTACK_WEBHOOK_SECRET` must **exactly match** what's in Paystack dashboard
- ✅ Restart the server after changing the secret
- ✅ Use the integration test: `bash scripts/test-webhook-local.sh`

### "Prisma client not generated"
- ✅ Run `npx prisma generate` manually
- ✅ Or run `npm run setup` (does everything)

---

## 📋 Production Deployment Checklist

When you're ready to go live:

- [ ] Switch from `sk_test_` to `sk_live_` Paystack keys
- [ ] Switch from `pk_test_` to `pk_live_` Paystack public key
- [ ] Set the production `PAYSTACK_WEBHOOK_SECRET`
- [ ] Update Paystack webhook URL to production domain
- [ ] Update Supabase DATABASE_URL if using a different prod instance
- [ ] Set production `FRONTEND_URL` and `API_URL`
- [ ] Test with real M-Pesa number (real money!)
- [ ] Set up monitoring (UptimeRobot, Sentry)
- [ ] Enable Supabase PITR backup
- [ ] Get CBK M-Pesa approval (1-2 day process)
- [ ] Add custom domain (geton.co.ke)

---

## 🎯 Your Demo Credentials (in DB after seed)

- **Admin:** `admin@geton.co.ke` / `Admin1234!`
- **Demo User:** `demo@geton.co.ke` / `Demo1234!`
- **Phone:** `+254712345678`
- **National ID:** `12345678`
- **KRA PIN:** `A012345678Z`

---

**You're all set! Run `npm run setup` to initialize the database, then `npm run dev` to start the API.** 🚀
