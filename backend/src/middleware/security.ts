import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger.js";

/**
 * Security headers middleware.
 * These headers are also set by Helmet, but we set them explicitly here
 * to ensure they're applied to EVERY response (including errors).
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // HSTS — force HTTPS for 2 years, include subdomains, preload
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Clickjacking protection
  res.setHeader("X-Frame-Options", "DENY");

  // XSS protection (legacy, but still good defense in depth)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy — disable unused browser features
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(self), gyroscope=(), " +
      "magnetometer=(), microphone=(), payment=(self), usb=(), " +
      "interest-cohort=(), browsing-topics=()",
  );

  // Cross-origin policies
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  // Force HTTPS for 1 year (additional to HSTS)
  // (HSTS is the primary mechanism, this is fallback)
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Disable dangerous browser features
  res.setHeader("X-DNS-Prefetch-Control", "on");

  // Don't cache sensitive responses
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Content Security Policy (defense in depth)
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https: data:",
      "connect-src 'self' https://api.paystack.co https://*.paystack.co https://api.africastalking.com",
      "frame-src https://checkout.paystack.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  // Cross-domain policy (legacy IE)
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  next();
}

/**
 * Honeypot — block spam bots that fill hidden fields
 */
export function honeypot(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object" && (req.body as any).website) {
    logger.warn({ ip: req.ip }, "Honeypot triggered");
    res.status(400).json({ success: false, error: "Bad request" });
    return;
  }
  next();
}

/**
 * Check for common SQL injection patterns in body and params
 */
export function sqlInjectionGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const dangerous = /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|table|database)\b)|(--|;.*--|xp_)/i;
  const inputs = [
    ...Object.values(req.body || {}).map(String),
    ...Object.values(req.query || {}).map(String),
    ...Object.values(req.params || {}).map(String),
  ];
  for (const value of inputs) {
    if (dangerous.test(value)) {
      logger.warn(
        { ip: req.ip, value: value.substring(0, 100) },
        "Possible SQL injection attempt blocked",
      );
      res.status(400).json({ success: false, error: "Invalid input" });
      return;
    }
  }
  next();
}

/**
 * XSS guard — strip dangerous HTML from string inputs
 */
export function sanitizeStrings(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const stripHtml = (str: string): string => {
    return str.replace(/<[^>]*>/g, "").trim();
  };
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") return stripHtml(obj);
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === "object") {
      const out: any = {};
      for (const key in obj) {
        out[key] = sanitize(obj[key]);
      }
      return out;
    }
    return obj;
  };
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
}

/**
 * Verify request origin (CSRF protection for state-changing requests)
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[];

  // Allow API clients without origin (mobile apps, server-side)
  // by checking for the Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }

  if (!origin) {
    // No origin and no auth — reject for browser-based requests
    res.status(403).json({ success: false, error: { code: "CSRF_BLOCKED" } });
    return;
  }

  if (!allowedOrigins.some((o) => origin.startsWith(o))) {
    logger.warn({ ip: req.ip, origin }, "CSRF: Invalid origin");
    res.status(403).json({ success: false, error: { code: "CSRF_BLOCKED" } });
    return;
  }

  next();
}
