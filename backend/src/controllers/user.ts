import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { sanitizeUser } from "../utils.js";
import { UnauthorizedError } from "../errors.js";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
});

/**
 * GET /api/v1/users/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { kyc: true },
  });
  if (!user) throw new UnauthorizedError();
  res.json({ success: true, data: sanitizeUser(user) });
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const data = req.body as z.infer<typeof updateProfileSchema>;
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data,
  });
  res.json({ success: true, data: sanitizeUser(user) });
}

export async function getDevices(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const devices = await prisma.device.findMany({
    where: { userId: req.user.userId },
    orderBy: { lastActive: "desc" },
  });
  res.json({ success: true, data: devices });
}

export async function revokeDevice(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  await prisma.device.deleteMany({
    where: { id, userId: req.user.userId },
  });
  res.json({ success: true });
}

export async function getStats(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const [loans, transactions, kyc] = await Promise.all([
    prisma.loan.findMany({
      where: { userId: req.user.userId },
      select: { amount: true, status: true, amountPaid: true, totalRepayment: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: req.user.userId, status: "successful" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.kYC.findUnique({ where: { userId: req.user.userId } }),
  ]);

  const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.amountPaid, 0);
  const activeLoan = loans.find(
    (l) => l.status === "active" || l.status === "approved",
  );

  res.json({
    success: true,
    data: {
      totalBorrowed,
      totalRepaid,
      activeLoan,
      transactionCount: transactions._count,
      transactionVolume: transactions._sum.amount ?? 0,
      kycLevel: kyc?.status ?? "pending",
    },
  });
}
