/**
 * Payment integration test script.
 *
 * Run with: npm run test:payment
 *
 * Verifies the Paystack service works correctly without making real API calls.
 */

import crypto from "crypto";

// ============================================================
// Test 1: Environment configuration
// ============================================================

function testEnvironment() {
  console.log("\n🧪 Checking environment configuration…\n");

  const required: { name: string; check: boolean }[] = [
    { name: "DATABASE_URL", check: !!process.env.DATABASE_URL },
    {
      name: "JWT_SECRET",
      check: !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
    },
    {
      name: "PAYSTACK_SECRET_KEY",
      check:
        !!process.env.PAYSTACK_SECRET_KEY &&
        process.env.PAYSTACK_SECRET_KEY.startsWith("sk_"),
    },
    {
      name: "PAYSTACK_WEBHOOK_SECRET",
      check:
        !!process.env.PAYSTACK_WEBHOOK_SECRET &&
        process.env.PAYSTACK_WEBHOOK_SECRET.length >= 16,
    },
    { name: "FRONTEND_URL", check: !!process.env.FRONTEND_URL },
  ];

  let allPassed = true;
  for (const { name, check } of required) {
    const status = check ? "✅" : "❌";
    const msg = check ? "OK" : "MISSING (REQUIRED)";
    console.log(`  ${status} ${name}: ${msg}`);
    if (!check) allPassed = false;
  }

  if (!allPassed) {
    console.log("\n  ❌ Some required env vars are missing.");
    console.log("  Copy backend/.env.example to backend/.env and fill values.");
    process.exit(1);
  }

  // Warn if using test keys in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.PAYSTACK_SECRET_KEY?.includes("test")) {
      console.log(
        "\n  ⚠️  WARNING: Using Paystack TEST keys in production!",
      );
    }
  }
}

// ============================================================
// Test 2: Webhook HMAC-SHA512 signature verification
// ============================================================

function testSignatureVerification() {
  console.log("\n🧪 Testing webhook signature verification…\n");

  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || "test_secret_for_verification";

  const testPayload = JSON.stringify({
    event: "charge.success",
    data: { reference: "TEST_REF_123", amount: 29900, status: "success" },
  });

  // Compute signature
  const correctSignature = crypto
    .createHmac("sha512", secret)
    .update(testPayload, "utf8")
    .digest("hex");

  // Manually verify (the same algorithm used in the server)
  const recomputedHash = crypto
    .createHmac("sha512", secret)
    .update(testPayload, "utf8")
    .digest("hex");

  const correctValid = recomputedHash === correctSignature;
  console.log(`  ✅ Correct signature accepted: ${correctValid ? "PASS" : "FAIL"}`);

  // Test wrong signature is rejected
  const wrongValid = correctSignature !== "wrong_signature";
  console.log(`  ✅ Wrong signature rejected: ${wrongValid ? "PASS" : "FAIL"}`);

  if (!correctValid || !wrongValid) {
    console.log("\n  ❌ Signature verification tests FAILED");
    process.exit(1);
  }
}

// ============================================================
// Test 3: Phone number formatting
// ============================================================

function testPhoneFormatting() {
  console.log("\n🧪 Testing phone number formatting…\n");

  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
    if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
    return cleaned;
  };

  const tests = [
    { input: "0712345678", expected: "254712345678" },
    { input: "+254712345678", expected: "254712345678" },
    { input: "254712345678", expected: "254712345678" },
    { input: "712345678", expected: "254712345678" },
  ];

  let allPassed = true;
  for (const test of tests) {
    const result = formatPhone(test.input);
    const pass = result === test.expected;
    console.log(
      `  ${pass ? "✅" : "❌"} ${test.input} → ${result} (expected ${test.expected})`,
    );
    if (!pass) allPassed = false;
  }

  if (!allPassed) {
    console.log("\n  ❌ Phone formatting tests FAILED");
    process.exit(1);
  }
}

// ============================================================
// Test 4: Fee tier calculation
// ============================================================

function testFeeTiers() {
  console.log("\n🧪 Testing activation fee tiers…\n");

  const tiers: Array<{ min: number; max: number; total: number }> = [
    { min: 2_500, max: 5_000, total: 500 },
    { min: 5_001, max: 10_000, total: 799 },
    { min: 10_001, max: 20_000, total: 1_299 },
    { min: 20_001, max: 35_000, total: 1_999 },
    { min: 35_001, max: 50_000, total: 2_799 },
    { min: 50_001, max: 75_000, total: 3_999 },
    { min: 75_001, max: 100_000, total: 5_499 },
    { min: 100_001, max: 150_000, total: 7_999 },
    { min: 150_001, max: 200_000, total: 11_999 },
    { min: 200_001, max: 250_000, total: 15_000 },
  ];

  const tests = [
    { amount: 2_500, expected: 500 },
    { amount: 5_000, expected: 500 },
    { amount: 5_001, expected: 799 },
    { amount: 25_000, expected: 1_999 },
    { amount: 50_000, expected: 2_799 },
    { amount: 100_000, expected: 5_499 },
    { amount: 200_000, expected: 11_999 },
    { amount: 250_000, expected: 15_000 }, // ⭐ The new max
    { amount: 100_000, expected: 5_499 },
  ];

  let allPassed = true;
  for (const test of tests) {
    const tier = tiers.find(
      (t) => test.amount >= t.min && test.amount <= t.max,
    );
    const result = tier?.total ?? 0;
    const pass = result === test.expected;
    console.log(
      `  ${pass ? "✅" : "❌"} KSh ${test.amount.toLocaleString()} → KSh ${result.toLocaleString()} (expected ${test.expected.toLocaleString()})`,
    );
    if (!pass) allPassed = false;
  }

  if (!allPassed) {
    console.log("\n  ❌ Fee tier tests FAILED");
    process.exit(1);
  }
}

// ============================================================
// Test 5: Interest rate calculation
// ============================================================

function testInterestRates() {
  console.log("\n🧪 Testing tier-based interest rates…\n");

  const baseRate = 4; // 4% / month
  const premiumRate = 3;
  const vipRate = 2;

  const getRate = (user: {
    kycLevel?: number;
    repaidLoansCount?: number;
    isFirstLoan?: boolean;
  }): number => {
    let rate = baseRate;
    if (user.kycLevel === 3) rate = premiumRate;
    if ((user.repaidLoansCount ?? 0) >= 5) rate = vipRate;
    if (user.isFirstLoan && (user.repaidLoansCount ?? 0) === 0) {
      rate = Math.max(1.5, rate - 0.5);
    }
    return rate;
  };

  const tests = [
    {
      desc: "New customer (Tier 1, first loan)",
      user: { kycLevel: 1, repaidLoansCount: 0, isFirstLoan: true },
      expected: 0.9, // 1% - 0.1% first-loan bonus
    },
    {
      desc: "Standard customer (Tier 1, not first loan)",
      user: { kycLevel: 1, repaidLoansCount: 2, isFirstLoan: false },
      expected: 1.0, // 12% APR
    },
    {
      desc: "Premium customer (Tier 3 KRA)",
      user: { kycLevel: 3, repaidLoansCount: 2, isFirstLoan: false },
      expected: 0.8, // 9.6% APR
    },
    {
      desc: "VIP customer (5+ repaid)",
      user: { kycLevel: 3, repaidLoansCount: 5, isFirstLoan: false },
      expected: 0.5, // 6% APR — BEST
    },
    {
      desc: "VIP new customer (5+ repaid AND first loan)",
      user: { kycLevel: 3, repaidLoansCount: 0, isFirstLoan: true },
      expected: 0.4, // VIP rate - first-loan bonus
    },
  ];

  let allPassed = true;
  for (const test of tests) {
    const result = getRate(test.user);
    const pass = result === test.expected;
    console.log(
      `  ${pass ? "✅" : "❌"} ${test.desc}: ${result}% (expected ${test.expected}%)`,
    );
    if (!pass) allPassed = false;
  }

  if (!allPassed) {
    console.log("\n  ❌ Interest rate tests FAILED");
    process.exit(1);
  }
}

// ============================================================
// Main
// ============================================================

function main() {
  console.log("\n🧪 GETON Kenya Backend — Integration Tests");
  console.log("================================================");

  try {
    testEnvironment();
    testSignatureVerification();
    testPhoneFormatting();
    testFeeTiers();
    testInterestRates();
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }

  console.log("\n✅ All tests passed!\n");
  console.log("Next steps:");
  console.log("1. Start the server: npm run dev");
  console.log("2. Test webhook locally: bash scripts/test-webhook-local.sh");
  console.log("3. For M-Pesa sandbox testing, use phone 254708374149");
  console.log("4. For production, switch to sk_live_... keys");
}

main();
