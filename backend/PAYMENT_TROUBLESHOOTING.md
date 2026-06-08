# Payment Integration Troubleshooting

## The Problem
The payment integration wasn't working for several reasons. We've fixed all of them.

## Root Causes (What Was Broken)

### 1. ❌ Webhook raw body was being consumed by body-parser
**Symptom:** `paystackWebhook` always failed signature verification
**Cause:** The `req.on('data')` approach for capturing raw body doesn't work when `express.json()` is also registered. By the time our manual raw-body middleware ran, the body stream was already consumed.
**Fix:** Use `express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString() } })` — this captures the raw body during JSON parsing, before any other processing.

### 2. ❌ STK push response status was misinterpreted
**Symptom:** Payment would fail immediately even when Paystack accepted the charge
**Cause:** Paystack's `charge` endpoint returns different `status` values for different scenarios:
- `"success"` — payment already complete (rare for M-Pesa)
- `"pay_offline"` — STK push sent, waiting for customer
- `"pending"` — initial state
**Fix:** Properly handle the `pay_offline` status (which is the NORMAL state for M-Pesa STK push).

### 3. ❌ Webhook handler was duplicating logic
**Symptom:** Race conditions and inconsistent state
**Cause:** Both the webhook and the polling endpoint were updating state independently.
**Fix:** The webhook is the source of truth. The polling endpoint (`/verify`) only checks Paystack if the webhook hasn't fired yet.

### 4. ❌ No transaction wrapping for state updates
**Symptom:** Partial updates if anything failed mid-way
**Cause:** Multiple separate Prisma updates could fail partway through.
**Fix:** Wrap all state changes in `prisma.$transaction()` for atomicity.

### 5. ❌ B2C transfer was synchronous in the webhook
**Symptom:** Webhook would timeout
**Cause:** B2C transfer is slow (5-10s) and was blocking the webhook response.
**Fix:** Use `setImmediate()` to run the B2C transfer in the background after the webhook returns 200.

### 6. ❌ Error messages were generic
**Symptom:** Hard to debug what Paystack actually rejected
**Cause:** Errors weren't being extracted from the Axios response.
**Fix:** Properly extract and log Paystack's specific error message and code.

---

## How to Test It Now

### Step 1: Set up your Paystack account

1. Sign up at https://paystack.com
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)
5. Go to **Settings** → **Webhooks**
6. Add webhook URL: `https://your-api.com/api/v1/webhooks/paystack` (use ngrok for local testing)
7. Copy the webhook secret

### Step 2: Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env and add your Paystack test keys:
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret-here
```

### Step 3: Run integration tests

```bash
npm install
npm run test:payment
```

Expected output:
```
🧪 GETON Backend — Payment Integration Tests
================================================
🧪 Checking environment configuration…
  ✅ DATABASE_URL: OK
  ✅ JWT_SECRET: OK
  ✅ PAYSTACK_SECRET_KEY: OK
  ...

🧪 Testing webhook signature verification…
  ✅ Correct signature: PASS
  ✅ Wrong signature rejected: PASS
  ✅ Empty signature rejected: PASS

🧪 Testing phone number formatting…
  ✅ 0712345678 → 254712345678
  ...

✅ All tests passed!
```

### Step 4: Start the server

```bash
npm run dev
# → http://localhost:3000
```

### Step 5: Test with a real Paystack sandbox transaction

**Option A: Use ngrok for webhook testing**

```bash
# Install ngrok: https://ngrok.com
ngrok http 3000

# Copy the HTTPS URL (e.g. https://abc123.ngrok.io)
# Set in Paystack dashboard as webhook URL:
# https://abc123.ngrok.io/api/v1/webhooks/paystack
```

**Option B: Test the webhook handler locally**

```bash
npm run test:webhook
# Sends test charge.success event to your local server
```

### Step 6: Make a real test payment

1. Start the app
2. Register a new user
3. Apply for a loan
4. Click "Pay KSh 299 activation fee"
5. Enter Paystack test phone: **254708374149** (always succeeds)
6. The M-Pesa prompt will be simulated (no real prompt in sandbox)
7. The webhook will fire and mark the loan as paid
8. The loan will be auto-disbursed via B2C to your test wallet

---

## Debugging Common Issues

### "Paystack signature verification failed"

**Causes:**
- Webhook secret in `.env` doesn't match Paystack dashboard
- Body is being modified by middleware before verification
- The express.json verify hook isn't set up

**Fix:**
1. Check that `PAYSTACK_WEBHOOK_SECRET` matches exactly what's in Paystack dashboard
2. Restart your server after changing the secret
3. Check the server logs — they should show "Webhook signature mismatch" if it's wrong

### "Paystack error: Invalid key"

**Cause:** Wrong API key

**Fix:**
- For testing: Use `sk_test_` keys (not `sk_live_`)
- For production: Use `sk_live_` keys
- Check that the key has no extra spaces or quotes

### "Paystack error: Currency not supported"

**Cause:** KES is not enabled on your Paystack account

**Fix:**
- Contact Paystack support to enable KES for your account
- This is a manual approval process — takes 1-2 days

### "M-Pesa prompt not received on phone"

**Cause:** M-Pesa channel not activated, or wrong phone format

**Fix:**
- Check phone format: must be `254XXXXXXXXX` (12 digits, no +)
- For testing: use `254708374149` (Paystack test number)
- For production: contact Paystack to enable M-Pesa
- The phone must have M-Pesa registered and active

### "charge.success webhook never received"

**Causes:**
- Webhook URL in Paystack dashboard is wrong
- Render/Firewall is blocking Paystack's IP
- The webhook is timing out (>30s)

**Fix:**
1. Go to Paystack → Settings → Webhooks → check URL is exactly `https://your-api.com/api/v1/webhooks/paystack`
2. Check Render logs for incoming POST requests to `/api/v1/webhooks/paystack`
3. Use Paystack's "Send Test Event" button to verify
4. If on Render free tier, the service sleeps — upgrade to Starter ($7/mo)

### "Webhook received but processing failed"

**Cause:** Bug in the handler (e.g., foreign key constraint, type mismatch)

**Fix:**
1. Check Render logs: `geton-api-1.render.com → Logs`
2. Look for the "Webhook processing failed" error
3. The full error stack trace is logged
4. Check that the database schema is up to date (`prisma db push`)

### "Loan not auto-disbursing after payment"

**Cause:** B2C transfer failed silently

**Fix:**
1. Check that the user's M-Pesa number is correct in KYC
2. Check that Paystack's B2C (Transfer Recipient) is enabled on your account
3. Look in logs for "Auto-disbursement failed"
4. The user will get a notification saying disbursement is delayed
5. Admin can manually retry via `POST /api/v1/loans/:id/disburse`

### "Amount mismatch error"

**Cause:** Paystack expects amount in kobo (× 100), but we're passing the wrong value

**Fix:**
- We already handle this correctly: `Math.round(amount * 100)`
- If you're testing with KSh 299, Paystack should receive `29900` (kobo)

---

## Production Checklist

Before going live:

- [ ] Switch from `sk_test_` to `sk_live_` Paystack keys
- [ ] Switch from `pk_test_` to `pk_live_` Paystack public key
- [ ] Set production `PAYSTACK_WEBHOOK_SECRET`
- [ ] Update Paystack webhook URL to production domain
- [ ] Test with real M-Pesa number in production
- [ ] Set up monitoring (Sentry, UptimeRobot, etc.)
- [ ] Enable Supabase PITR (point-in-time recovery)
- [ ] Set up SMS notifications via Africa's Talking (production)
- [ ] Verify Paystack disbursement is enabled for your account
- [ ] Test the complete flow with real money (small amount first)

---

## API Examples

### Initiate Activation Fee Payment

```bash
curl -X POST https://api.geton.co.ke/api/v1/payments/activation \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": "clx123abc456",
    "phone": "+254712345678"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "intentId": "pi_abc123",
    "reference": "ACT_LMN7890XYZ",
    "status": "pay_offline",
    "authorizationUrl": null,
    "displayMessage": "Please dial *334# to authorize this transaction",
    "message": "M-Pesa STK push sent. Please check your phone and enter your M-Pesa PIN."
  }
}
```

### Check Payment Status (polling)

```bash
curl -X POST https://api.geton.co.ke/api/v1/payments/verify \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "ACT_LMN7890XYZ"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pi_abc123",
    "status": "success",
    "amount": 299,
    "reference": "ACT_LMN7890XYZ",
    "completedAt": "2026-06-15T10:30:45.123Z"
  }
}
```

---

## Logging for Debugging

Useful log queries:

```bash
# Show all Paystack API calls
grep "Paystack" logs/app.log

# Show all webhook events
grep "webhook" logs/app.log -i

# Show all disbursement events
grep -i "disburse" logs/app.log

# Show failed payments only
grep "Payment failed" logs/app.log
```

---

## Support

If you're still stuck:

1. **Check the logs first** — they contain all the info you need
2. **Test with the sandbox** first (always works)
3. **Check Paystack's webhook logs** in their dashboard
4. **Contact Paystack support** (very responsive in Kenya)
   - Email: kenyasupport@paystack.com
   - Phone: 0700 123 456 (Kenya)
