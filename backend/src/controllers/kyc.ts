import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notifications } from "../services/notifications.js";
import { sms } from "../services/sms.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors.js";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { isValidKraPin, isValidNationalId, isValidPhone, formatPhone } from "../utils.js";

// =============== Validation schemas ===============

export const submitKycSchema = z.object({
  fullName: z.string().min(2),
  nationalId: z.string().regex(/^\d{7,9}$/),
  kraPin: z.string().regex(/^[A-Z]\d{9}[A-Z]$/i).optional(),
  mpesaNumber: z.string().min(10).optional(),
  bankName: z.string().min(2).optional(),
  bankAccount: z.string().min(5).optional(),
  addressLine: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  county: z.string().min(2).optional(),
});

export const uploadDocSchema = z.object({
  type: z.enum(["idFront", "idBack", "selfie", "address"]),
  url: z.string().url(),
});

// =============== Handlers ===============

/**
 * GET /api/v1/kyc
 * Get current KYC status
 */
export async function getKyc(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const kyc = await prisma.kYC.findUnique({
    where: { userId: req.user.userId },
  });
  res.json({ success: true, data: kyc });
}

/**
 * POST /api/v1/kyc
 * Submit/update KYC information
 */
export async function submitKyc(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const data = req.body as z.infer<typeof submitKycSchema>;

  if (!isValidNationalId(data.nationalId)) {
    throw new BadRequestError("Invalid National ID");
  }
  if (data.kraPin && !isValidKraPin(data.kraPin)) {
    throw new BadRequestError("Invalid KRA PIN format");
  }
  if (data.mpesaNumber && !isValidPhone(data.mpesaNumber)) {
    throw new BadRequestError("Invalid M-Pesa number");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  // Check for ID duplicates
  const existingId = await prisma.kYC.findFirst({
    where: {
      nationalId: data.nationalId,
      userId: { not: user.id },
    },
  });
  if (existingId) {
    throw new BadRequestError("National ID already registered");
  }

  // Determine new KYC level
  let newLevel = user.kycLevel;
  const hasAllTier1 = data.nationalId;
  const hasAllTier2 = hasAllTier1 && data.mpesaNumber;
  const hasAllTier3 = hasAllTier2 && data.kraPin;

  if (hasAllTier3) newLevel = 3;
  else if (hasAllTier2) newLevel = 2;

  // Update KYC
  const kyc = await prisma.kYC.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: data.fullName,
      nationalId: data.nationalId,
      kraPin: data.kraPin?.toUpperCase(),
      mpesaNumber: data.mpesaNumber ? formatPhone(data.mpesaNumber) : undefined,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      addressLine: data.addressLine,
      city: data.city,
      county: data.county,
      status: "pending",
    },
    update: {
      fullName: data.fullName,
      nationalId: data.nationalId,
      kraPin: data.kraPin?.toUpperCase(),
      mpesaNumber: data.mpesaNumber ? formatPhone(data.mpesaNumber) : undefined,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      addressLine: data.addressLine,
      city: data.city,
      county: data.county,
      status: "pending",
    },
  });

  // Update user KYC level + loan limit
  const newLimit = newLevel === 3 ? 250_000 : newLevel === 2 ? 150_000 : 50_000;
  await prisma.user.update({
    where: { id: user.id },
    data: { kycLevel: newLevel, loanLimit: newLimit },
  });

  await notifications.create(user.id, {
    title: "KYC submitted",
    message: `Your KYC is being reviewed. We'll notify you once verified. Your loan limit is now KSh ${newLimit.toLocaleString()}.`,
    type: "info",
    category: "kyc",
  });

  logger.info(
    { userId: user.id, newLevel, newLimit },
    "KYC submitted",
  );

  res.json({ success: true, data: { kyc, kycLevel: newLevel, loanLimit: newLimit } });
}

/**
 * POST /api/v1/kyc/upload
 * Upload a document (ID front/back, selfie, proof of address)
 * In production, the URL would point to a CDN/S3 location
 */
export async function uploadDocument(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { type, url } = req.body as z.infer<typeof uploadDocSchema>;

  const kyc = await prisma.kYC.findUnique({
    where: { userId: req.user.userId },
  });
  if (!kyc) throw new NotFoundError("Submit KYC first");

  const data: any = {};
  if (type === "idFront") data.idFrontUrl = url;
  else if (type === "idBack") data.idBackUrl = url;
  else if (type === "selfie") data.selfieUrl = url;
  else if (type === "address") {
    // Store address URL in metadata
    data.metadata = JSON.stringify({ addressProofUrl: url });
  }

  await prisma.kYC.update({ where: { userId: req.user.userId }, data });

  res.json({ success: true });
}
