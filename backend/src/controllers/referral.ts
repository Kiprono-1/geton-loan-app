import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { UnauthorizedError } from "../errors.js";

/**
 * GET /api/v1/referrals
 * Get user's referral code and stats
 */
export async function getReferralInfo(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, fullName: true },
  });
  if (!user) throw new UnauthorizedError();

  // Generate deterministic code from user ID
  const code =
    "GETON" +
    user.fullName
      .split(" ")[0]
      .toUpperCase()
      .slice(0, 3) +
    user.id.slice(-4).toUpperCase();

  // In a real system you'd have a Referral model. For now, count signups
  // by IP/userAgent. For simplicity we return mock stats.
  res.json({
    success: true,
    data: {
      code,
      link: `${configFrontendUrl()}/register?ref=${code}`,
      invited: 0,
      successful: 0,
      earned: 0,
    },
  });
}

function configFrontendUrl() {
  return process.env.FRONTEND_URL || "https://geton.co.ke";
}
