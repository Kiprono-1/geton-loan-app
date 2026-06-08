import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../errors.js";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  formatPhone,
  genRef,
  sanitizeUser,
} from "../utils.js";
import { notifications } from "../services/notifications.js";
import { sms } from "../services/sms.js";
import { logger } from "../logger.js";

const BCRYPT_ROUNDS = 12;

// =============== Validation schemas ===============

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(128),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(1),
}).refine(d => d.email || d.phone, {
  message: "Either email or phone is required",
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const setPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
});

export const verifyPhoneSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

// =============== In-memory OTP store (use Redis in production) ===============

const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeOtp(phone: string, code: string): number {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
  otpStore.set(phone, { code, expiresAt });
  return expiresAt;
}

function verifyOtp(phone: string, code: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(phone);
  return true;
}

// Clean expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (now > val.expiresAt) otpStore.delete(key);
  }
}, 10 * 60 * 1000);

// =============== Handlers ===============

export async function register(req: Request, res: Response): Promise<void> {
  const { fullName, email, phone: rawPhone, password, referralCode } =
    req.body as z.infer<typeof registerSchema>;

  if (!isValidEmail(email)) throw new BadRequestError("Invalid email");
  if (!isValidPhone(rawPhone)) throw new BadRequestError("Invalid phone");
  if (!isValidPassword(password)) {
    throw new BadRequestError(
      "Password must be 8+ chars with uppercase, lowercase, and number",
    );
  }

  const phone = formatPhone(rawPhone);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Check for existing user
  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { phone } }),
  ]);

  if (existingEmail) throw new ConflictError("Email already registered");
  if (existingPhone) throw new ConflictError("Phone already registered");

  // Create user + KYC record in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        kycLevel: 1,
        kycStatus: "pending",
        creditScore: 0,
        loanLimit: 50_000, // KSh 50,000 starting limit
      },
    });

    await tx.kYC.create({
      data: {
        userId: newUser.id,
        fullName,
        mpesaNumber: phone,
        status: "pending",
      },
    });

    return newUser;
  });

  // Welcome notification + welcome SMS
  await notifications.create(user.id, {
    title: "Karibu GETON 🎉",
    message:
      "Your account is ready. You can now request loans up to KSh 50,000.",
    type: "success",
    category: "system",
    sendSms: true,
    smsMessage: `Karibu GETON! Your account is ready. Borrow up to KSh 50,000 sent to your M-Pesa.`,
  });

  // Send phone verification OTP
  const otp = generateOtp();
  storeOtp(phone, otp);
  await sms.sendOtp(phone, otp);

  // Issue tokens
  const tokens = await issueTokens(user);

  logger.info({ userId: user.id }, "User registered");

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      ...tokens,
      // In dev mode, return OTP so you can test
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, phone: rawPhone, password } = req.body as z.infer<
    typeof loginSchema
  >;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(rawPhone ? [{ phone: formatPhone(rawPhone) }] : []),
      ],
    },
  });

  if (!user) throw new UnauthorizedError("Invalid credentials");
  if (!user.isActive) throw new UnauthorizedError("Account is disabled");
  if (user.isBlocked) {
    throw new UnauthorizedError(`Account blocked: ${user.blockReason}`);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Invalid credentials");

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Log this device
  const deviceName = (req.headers["x-device-name"] as string) || "Unknown";
  const deviceOs = (req.headers["x-device-os"] as string) || "Unknown";
  await prisma.device.upsert({
    where: {
      userId_deviceId: {
        userId: user.id,
        deviceId: (req.headers["x-device-id"] as string) || req.ip || "unknown",
      },
    } as any,
    create: {
      userId: user.id,
      deviceId: (req.headers["x-device-id"] as string) || req.ip || "unknown",
      name: deviceName,
      os: deviceOs,
      ip: req.ip || "",
      location: (req.headers["x-device-location"] as string) || null,
    },
    update: { lastActive: new Date() },
  });

  const tokens = await issueTokens(user);

  logger.info({ userId: user.id }, "User logged in");

  res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      ...tokens,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired or revoked");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw new UnauthorizedError();

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(user);

  res.json({ success: true, data: tokens });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  } else if (req.user) {
    // Revoke all refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.userId } });
  }

  res.json({ success: true });
}

export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { currentPassword, newPassword } = req.body as z.infer<
    typeof changePasswordSchema
  >;
  if (!isValidPassword(newPassword)) {
    throw new BadRequestError("New password too weak");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Current password is incorrect");

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  // Revoke all refresh tokens (force re-login on other devices)
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  await notifications.create(user.id, {
    title: "Password changed",
    message:
      "Your password was successfully changed. If this wasn't you, contact support immediately.",
    type: "warning",
    category: "system" as any,
  });

  res.json({ success: true });
}

export async function setPin(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { pin } = req.body as z.infer<typeof setPinSchema>;
  const pinHash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: req.user.userId },
    data: { pinHash },
  });
  res.json({ success: true });
}

export async function sendPhoneOtp(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  const otp = generateOtp();
  storeOtp(user.phone, otp);
  await sms.sendOtp(user.phone, otp);

  res.json({
    success: true,
    data: {
      // Dev only — never expose in production
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    },
  });
}

export async function verifyPhone(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { code } = req.body as z.infer<typeof verifyPhoneSchema>;
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  if (!verifyOtp(user.phone, code)) {
    throw new BadRequestError("Invalid or expired code");
  }

  // Mark phone as verified — boosts KYC
  await prisma.user.update({
    where: { id: user.id },
    data: { kycLevel: Math.max(2, user.kycLevel) as 1 | 2 | 3 },
  });
  await prisma.kYC.update({
    where: { userId: user.id },
    data: { mpesaNumber: user.phone },
  });

  res.json({ success: true });
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { phone: rawPhone } = req.body as { phone: string };
  const phone = formatPhone(rawPhone);

  const user = await prisma.user.findUnique({ where: { phone } });
  // Always return success to prevent user enumeration
  if (!user) {
    res.json({ success: true });
    return;
  }

  const otp = generateOtp();
  storeOtp(phone, otp);
  await sms.sendOtp(phone, otp);

  res.json({
    success: true,
    data: {
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    },
  });
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { phone: rawPhone, code, newPassword } = req.body as {
    phone: string;
    code: string;
    newPassword: string;
  };

  if (!isValidPassword(newPassword)) {
    throw new BadRequestError("Password too weak");
  }

  const phone = formatPhone(rawPhone);
  if (!verifyOtp(phone, code)) {
    throw new BadRequestError("Invalid or expired code");
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new BadRequestError("Invalid code");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  res.json({ success: true });
}

// =============== Helper ===============

async function issueTokens(user: any) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || "user",
    kycLevel: user.kycLevel || 1,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
