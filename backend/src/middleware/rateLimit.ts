import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import type { Request } from "express";

/**
 * Get a stable client identifier (IP + user ID if authenticated).
 * Falls back to a generic key if IP is unavailable.
 */
function getKey(req: Request): string {
  const userId = (req as any).user?.userId;
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return userId ? `user:${userId}:${ip}` : `ip:${ip}`;
}

/**
 * Strict rate limit for sensitive endpoints (login, register, password reset)
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message:
        "Too many attempts. Please wait 15 minutes before trying again.",
    },
  },
});

/**
 * Moderate rate limit for payment endpoints
 */
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 payment attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many payment attempts. Please slow down.",
    },
  },
});

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please slow down.",
    },
  },
});

/**
 * Login-specific slow down (delays after failed attempts)
 */
export const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 2, // After 2 attempts
  delayMs: (hits) => hits * 500, // Increase delay by 500ms per attempt
  maxDelayMs: 10_000, // Cap at 10 seconds
});

/**
 * Strict rate limit for KYC submission
 */
export const kycRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKey,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many KYC submissions. Please try again later.",
    },
  },
});

/**
 * Webhook rate limit (more lenient but still protected)
 */
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // Paystack can send many webhooks
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true, // Don't count failed (400) requests
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip || "unknown",
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Webhook rate limit exceeded" },
  },
});
