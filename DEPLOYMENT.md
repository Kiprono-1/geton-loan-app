# GETON Kenya — Production Deployment Guide

## Stack
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase (PostgreSQL)
- **Payments:** Paystack (M-Pesa STK Push)

---

## 📋 Pre-Deployment Checklist

- [ ] Paystack live account with M-Pesa activated
- [ ] Supabase project created
- [ ] Vercel account
- [ ] Render account
- [ ] Domain (geton.co.ke) — optional but recommended
- [ ] Paystack webhook secret (in dashboard)
- [ ] Africa's Talking SMS account
- [ ] Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 1️⃣ Supabase (Database) Setup

### Create project

1. Go to https://supabase.com → **New Project**
2. Name: `geton-kenya`
3. Database password: **save this securely**
4. Region: **Singapore** (closest to Kenya with good latency)
5. Click **Create new project**

### Get connection string

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the **Transaction pooler** connection string (port 6543):
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Apply the schema

**Option A: Use Prisma from your local machine**

```bash
cd backend

# Set in .env
DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Push schema to Supabase
npm run db:push
```

**Option B: Use Supabase SQL Editor**

1. Go to **SQL Editor** in Supabase dashboard
2. Run this to enable the pgcrypto extension (Prisma needs it):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Then run Prisma migrations (or use the SQL dump from `npm run db:push`).

### Enable Row Level Security (optional, future)

For now, GETON uses Prisma which connects via the password, so RLS doesn't apply. We can add it later for direct API access.

---

## 2️⃣ Render (Backend) Deployment

### Prepare the backend

Make sure `backend/package.json` has:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/server.js",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

The Dockerfile is already in `backend/Dockerfile` for Docker deployment.

### Create Web Service on Render

1. Go to https://render.com → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Field | Value |
|---|---|
| **Name** | `geton-api` |
| **Region** | Singapore (or Oregon) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Starter ($7/mo) or higher |

### Add Environment Variables

In Render → Environment, add:

```bash
NODE_ENV=production
PORT=10000
API_URL=https://geton-api.onrender.com
FRONTEND_URL=https://geton.co.ke

# Supabase Database
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Auth (generate a secure 64-char hex)
JWT_SECRET=<generate-64-byte-random-hex>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Paystack (LIVE keys, not test!)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=<from-paystack-dashboard>

# Africa's Talking SMS
AT_API_KEY=<your-api-key>
AT_USERNAME=geton_co_ke
AT_SENDER_ID=GETON

LOG_LEVEL=info
```

### Configure Paystack Webhook

After deployment:

1. Get your Render URL: `https://geton-api.onrender.com`
2. Go to Paystack Dashboard → Settings → Webhooks
3. Add webhook URL: `https://geton-api.onrender.com/api/v1/webhooks/paystack`
4. Subscribe to events:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`
   - `transfer.failed`
   - `transfer.reversed`
5. Copy the webhook secret to `PAYSTACK_WEBHOOK_SECRET` in Render

### Health check

Render will ping `/api/health` automatically. The endpoint returns:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "geton-api",
    "env": "production"
  }
}
```

### Seed the database (optional)

After first deploy, to add demo data:

1. Go to Render → Shell tab
2. Run: `npm run db:seed`

---

## 3️⃣ Vercel (Frontend) Deployment

### Prepare the frontend

Make sure the frontend has these files at the root:

- `vercel.json` (create this if not present)
- `.env.example` with `VITE_API_URL`

Create `vercel.json` at the project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "accelerometer=(), camera=(), geolocation=(self), payment=(self)" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Create Vercel Project

1. Go to https://vercel.com → **Add New** → **Project**
2. Import your GitHub repo
3. Configure:

| Field | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (project root) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm install` |

### Add Environment Variables

In Vercel → Settings → Environment Variables:

```bash
VITE_API_URL=https://geton-api.onrender.com/api/v1
VITE_SITE_URL=https://geton.co.ke
```

### Deploy

Click **Deploy** — Vercel will:
1. Install dependencies
2. Run `npm run build`
3. Deploy to global edge network
4. Assign a URL like `https://geton-kenya.vercel.app`

---

## 4️⃣ Custom Domain Setup (Optional)

### Frontend (Vercel)

1. Buy domain from Namecheap/Cloudflare (e.g. `geton.co.ke`)
2. In Vercel → Settings → Domains → Add `geton.co.ke` and `www.geton.co.ke`
3. Add these DNS records at your registrar:

```
Type    Host    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

4. SSL is auto-provisioned by Vercel

### Backend (Render)

1. In Render → Settings → Custom Domain → Add `api.geton.co.ke`
2. Add CNAME record:

```
Type    Host    Value
CNAME   api     geton-api.onrender.com
```

3. SSL is auto-provisioned

### Update env vars

After domains are live:

**Vercel env:**
- `VITE_API_URL=https://api.geton.co.ke/api/v1`
- `VITE_SITE_URL=https://geton.co.ke`

**Render env:**
- `API_URL=https://api.geton.co.ke`
- `FRONTEND_URL=https://geton.co.ke`

---

## 5️⃣ Supabase Production Hardening

### Enable Point-in-Time Recovery (PITR)

1. Go to **Database** → **Backups**
2. Enable PITR (paid add-on, ~$100/mo) for production

### Connection pooling

Render connects to Supabase. Use the **transaction pooler** (port 6543) in your `DATABASE_URL` for better performance under load.

### Backups

Supabase automatically backs up daily. For extra safety:

```bash
# Manual backup from your machine
pg_dump $DATABASE_URL > backup-$(date +%F).sql
```

---

## 6️⃣ Post-Deployment Verification

### Frontend checks (Vercel)

- ✅ Open `https://geton.co.ke` — should load
- ✅ Check `https://geton.co.ke/api/health` (no — that's the API)
- ✅ Check `https://geton.co.ke/robots.txt`
- ✅ Check `https://geton.co.ke/sitemap.xml`
- ✅ Check `https://geton.co.ke/.well-known/security.txt`
- ✅ Run Lighthouse: should score 95+ on all categories

### Backend checks (Render)

```bash
# Health
curl https://api.geton.co.ke/api/health

# Register
curl -X POST https://api.geton.co.ke/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@geton.co.ke",
    "phone": "+254712345678",
    "password": "Test1234!"
  }'
```

### Webhook check

1. Go to Paystack Dashboard → Webhooks
2. Check that the webhook is "Active"
3. Send a test event
4. Check Render logs: `geton-api-1.render.com → Logs`

### CORS check

The frontend should be able to call the backend without CORS errors. If you see CORS errors:

1. Check `FRONTEND_URL` in Render env — must match your Vercel domain exactly
2. Check that CORS middleware includes the right origins (already configured in `server.ts`)

---

## 7️⃣ Monitoring & Alerts

### Render (Backend)

- Built-in metrics: CPU, memory, request count
- Set up alert: Email when response time > 2s
- Set up alert: Email when error rate > 1%

### Supabase (Database)

- Go to **Reports** → Enable daily performance reports
- Go to **Logs** → Set retention to 7 days (free tier)

### Uptime monitoring (free)

Use https://uptimerobot.com (free) to monitor:
- `https://api.geton.co.ke/api/health` (every 5 min)
- `https://geton.co.ke/` (every 5 min)
- Email/SMS alerts if down > 2 minutes

### Paystack (Payments)

Enable email notifications in Paystack dashboard for:
- Failed payments
- Large transactions
- Webhook failures

---

## 8️⃣ Costs (Monthly)

| Service | Tier | Cost |
|---|---|---|
| **Vercel** | Hobby (free) | $0 |
| **Render** | Starter | $7 |
| **Supabase** | Pro | $25 |
| **Paystack** | Pay-as-you-go | ~1.95% per transaction |
| **Africa's Talking SMS** | Pay-as-you-go | ~KSh 0.80/SMS |
| **Domain** | .co.ke | ~KSh 2,500/year |
| **Total infrastructure** | | **~$32/mo + usage** |

---

## 9️⃣ First-Time Production Deploy

```bash
# 1. Set up Supabase
# - Create project
# - Get DATABASE_URL
# - Run: cd backend && npm run db:push

# 2. Deploy to Render
# - Connect GitHub repo
# - Root: backend
# - Add all env vars from above
# - Deploy → wait 5-10 min

# 3. Get Render URL (e.g. geton-api.onrender.com)
# Update Paystack webhook URL to: https://geton-api.onrender.com/api/v1/webhooks/paystack

# 4. Deploy to Vercel
# - Connect GitHub repo
# - Add VITE_API_URL env var
# - Deploy → wait 1-2 min

# 5. Add custom domain (optional)
# - Vercel: Add geton.co.ke
# - Render: Add api.geton.co.ke
# - Update DNS

# 6. Test end-to-end
# - Open https://geton.co.ke
# - Sign up
# - Apply for a loan
# - Pay activation fee via M-Pesa sandbox
# - Confirm disbursement

# 7. Go live!
# - Switch Paystack to live keys
# - Switch Africa's Talking to production
# - Announce on social media
```

---

## 🆘 Troubleshooting

### "Database connection failed" on Render

- Check `DATABASE_URL` is correct
- Use the **transaction pooler** URL (port 6543), not the direct connection
- Make sure your Supabase project isn't paused (free tier pauses after 1 week of inactivity)

### "Paystack webhook not received"

- Check webhook URL in Paystack dashboard: `https://api.geton.co.ke/api/v1/webhooks/paystack`
- Check `PAYSTACK_WEBHOOK_SECRET` in Render matches the one in Paystack
- Test with Paystack's "Send Test Event" button
- Check Render logs for incoming POST to `/api/v1/webhooks/paystack`

### "CORS error" in browser

- Update `FRONTEND_URL` in Render to your exact Vercel domain
- Redeploy backend

### "Frontend can't reach backend"

- Check `VITE_API_URL` in Vercel is correct
- Check Render service is "Live" (not sleeping on free tier)
- Use browser DevTools → Network tab to see actual error

### "Paystack M-Pesa not working"

- M-Pesa must be activated in your Paystack account (contact support)
- For sandbox testing, use phone `254708374149`
- For production, real M-Pesa numbers must be in format `254XXXXXXXXX`

---

## 📞 Support Contacts

- **Paystack Kenya:** kenyasupport@paystack.com
- **Supabase:** support@supabase.com (Discord also very active)
- **Render:** support@render.com
- **Vercel:** support@vercel.com
- **Africa's Talking:** support@africastalking.com
- **KE Domain (.co.ke):** KENIC (kenic.or.ke)

---

🎉 You're ready to launch! Start with the dev tier for each service, then scale up as you grow.
