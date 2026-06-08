import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import slowDown from "express-slow-down";
import hpp from "hpp";
import { config } from "./config.js";
import { connectDB, disconnectDB } from "./db.js";
import { logger } from "./logger.js";
import { errorHandler, notFoundHandler, HttpError } from "./errors.js";
import {
  securityHeaders,
  honeypot,
  sqlInjectionGuard,
  sanitizeStrings,
} from "./middleware/security.js";
import router from "./routes/index.js";

const app = express();

// Trust proxy when behind load balancer / ngrok
app.set("trust proxy", 1);

// =============== SECURITY MIDDLEWARES (in order) ===============

// Custom security headers (applied to every response, even errors)
app.use(securityHeaders);

// Helmet for additional security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // we set our own CSP
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false, // we set our own
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    frameguard: { action: "deny" },
    xssFilter: true,
  }),
);

// CORS — strict whitelist
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = [
        config.frontendUrl,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
      ];
      if (allowed.includes(origin)) return cb(null, true);
      if (
        !config.isProd &&
        (origin.endsWith(".ngrok.io") ||
          origin.endsWith(".loca.lt") ||
          origin.endsWith(".serveo.net"))
      ) {
        return cb(null, true);
      }
      logger.warn({ origin }, "CORS: Blocked");
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Paystack-Signature",
      "X-Device-Id",
      "X-Device-Name",
      "X-Device-OS",
    ],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    maxAge: 86400, // 24h preflight cache
  }),
);

// HTTP Parameter Pollution prevention
app.use(
  hpp({
    whitelist: ["sort", "fields", "page", "limit", "cursor"],
  }),
);

// =============== BODY PARSING (CRITICAL: webhook raw body capture) ===============
// Use express.json with a `verify` hook that captures the raw body for
// HMAC signature verification. This is the ONLY reliable way to get
// the raw body — the manual req.on("data") approach doesn't work
// because the body-parser consumes the stream first.

app.use(
  express.json({
    limit: "100kb",
    verify: (req: any, _res, buf) => {
      // Capture the raw body for ALL routes
      req.rawBody = buf && buf.length ? buf.toString("utf8") : "";
    },
  }),
);

app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Compression (after body parsing)
app.use(compression());

// Security guards (in order)
app.use(honeypot);
app.use(sqlInjectionGuard);
app.use(sanitizeStrings);

// Disable X-Powered-By (info leak)
app.disable("x-powered-by");
app.disable("etag"); // Reduces fingerprinting

// =============== Request logging ===============
app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
    skip: (req) => req.url === "/api/health" || req.url === "/favicon.ico",
  }),
);

// Trust X-Forwarded-* for correct client IPs
app.set("trust proxy", 1);

// =============== Root ===============
app.get("/", (_req, res) => {
  res.json({
    service: "GETON Kenya API",
    version: "1.0.0",
    docs: "/api/health",
    endpoints: {
      health: "GET /api/health",
      auth: "/api/v1/auth/*",
      users: "/api/v1/users/*",
      loans: "/api/v1/loans/*",
      payments: "/api/v1/payments/*",
      kyc: "/api/v1/kyc/*",
      wallet: "/api/v1/wallet/*",
      transactions: "/api/v1/transactions/*",
      notifications: "/api/v1/notifications/*",
      referrals: "/api/v1/referrals/*",
    },
  });
});

// =============== API Routes ===============
app.use("/api", router);

// =============== Error handling ===============
app.use(notFoundHandler);
app.use(errorHandler);

// =============== Start ===============
async function bootstrap() {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        env: config.env,
        url: config.apiUrl,
      },
      `🚀 GETON API listening on ${config.apiUrl}`,
    );
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down…");
    server.close(async () => {
      await disconnectDB();
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
