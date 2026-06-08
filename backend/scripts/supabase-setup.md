# Supabase Setup Script

## Quick Setup (Recommended)

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Settings:
   - **Name:** `geton-kenya`
   - **Database Password:** (save this!)
   - **Region:** Singapore (or closest to Kenya)
4. Wait 2 minutes for provisioning

### 2. Get Connection String
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** → **Transaction pooler** (port 6543)
3. Copy this — looks like:
   ```
   postgresql://postgres.abcdefghij:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### 3. Apply Schema

**Option A: From your local machine (easiest)**
```bash
cd backend
# Add to .env
DATABASE_URL="postgresql://postgres.abcdefghij:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Push schema (creates all 13 tables)
npm run db:push
```

**Option B: Using Supabase SQL Editor (manual)**

1. Go to Supabase Dashboard → **SQL Editor** → **New query**
2. First, run this to enable pgcrypto:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```
3. Then run `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` to generate SQL
4. Copy the SQL output and paste it into the Supabase SQL Editor

**Option C: Using Prisma migrations (production-grade)**
```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate dev --name init
# Creates prisma/migrations/<timestamp>_init/migration.sql
DATABASE_URL="postgresql://..." npx prisma migrate deploy
# Applies the migration to your Supabase DB
```

### 4. Verify

Run this in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 13 tables:
- ActivationFee
- AuditLog
- Device
- KYC
- Loan
- LoanPayment
- Notification
- PaymentIntent
- RefreshToken
- Transaction
- User
- WebhookEvent
- _prisma_migrations

### 5. (Optional) Enable Row Level Security

For maximum security, enable RLS on user-specific tables:

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KYC" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Loan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Device" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;

-- Allow backend service role full access
-- (Our Prisma client uses the postgres role which bypasses RLS)
-- No additional policies needed for backend-only access
```

Since our backend uses Prisma with the postgres role (which bypasses RLS), RLS is only needed if you also expose the database directly to the frontend (which we don't).

### 6. Backups

Supabase Pro includes PITR (point-in-time recovery). For free tier:
- Daily backups are automatic
- Manual backup: Go to Database → Backups → Download

### 7. Connection Limits

For production with many concurrent users, use the **transaction pooler** (port 6543) which we already configured.

Free tier limits:
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users (more than enough for Kenya)
- 500 connections (pooled)

### 8. Monitoring

In Supabase Dashboard:
- **Database** → **Reports** — Performance insights
- **Logs** → **Database** — Query logs (7-day retention on free, 30-day on Pro)
- **API Logs** — REST/GraphQL activity

---

## Troubleshooting

### "Can't connect to Supabase from Render"

1. Check `DATABASE_URL` is the **transaction pooler** URL (port 6543), not direct (port 5432)
2. Make sure your Supabase project isn't paused
3. Try the **session pooler** URL instead if transaction pooler doesn't work

### "Permission denied for schema public"

Add this in Supabase SQL Editor:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### "SSL required" error

Add `?sslmode=require` to your DATABASE_URL:
```
postgresql://postgres.xxx:PASS@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
```

### Migrations failing on Render

The `postinstall` script in package.json runs `prisma generate` automatically. The schema is then pushed on first deploy via `db:push` (or use `migrate deploy` for production migrations).
