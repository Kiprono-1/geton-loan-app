#!/bin/bash
# Local webhook testing script
# Simulates Paystack sending a webhook to your local server

set -e

API_URL="${API_URL:-http://localhost:3000}"
WEBHOOK_SECRET="${PAYSTACK_WEBHOOK_SECRET:-test_secret_for_local}"

echo "🧪 Testing webhook locally..."
echo "API URL: $API_URL"
echo ""

# Test charge.success event
PAYLOAD='{
  "event": "charge.success",
  "data": {
    "id": 1234567,
    "reference": "ACT_TEST_'$(date +%s)'",
    "amount": 29900,
    "currency": "KES",
    "channel": "mobile_money",
    "status": "success",
    "paid_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "customer": {
      "email": "test@geton.co.ke",
      "phone": "+254712345678"
    },
    "metadata": {
      "intentId": "test_intent_id",
      "userId": "test_user_id",
      "loanId": "test_loan_id",
      "type": "activation-fee"
    }
  }
}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha512 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

echo "📤 Sending charge.success webhook..."
echo "  Payload: $PAYLOAD"
echo "  Signature: ${SIGNATURE:0:20}..."
echo ""

# Send the webhook
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/webhooks/paystack" \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIGNATURE" \
  -d "$PAYLOAD")

# Extract status code
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "📥 Response:"
echo "  Status: $HTTP_CODE"
echo "  Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Webhook accepted (HTTP 200)"
else
  echo "❌ Webhook failed (HTTP $HTTP_CODE)"
  echo "   Check your server logs and webhook secret"
  exit 1
fi

echo ""
echo "🧪 Testing with INVALID signature (should fail)..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/webhooks/paystack" \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: invalid_signature_here" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
echo "  Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Invalid signature correctly rejected (HTTP 401)"
else
  echo "❌ Invalid signature was not rejected (got HTTP $HTTP_CODE)"
  exit 1
fi

echo ""
echo "🎉 All webhook tests passed!"
echo ""
echo "Next: configure your Paystack dashboard to send webhooks to:"
echo "  $API_URL/api/v1/webhooks/paystack"
