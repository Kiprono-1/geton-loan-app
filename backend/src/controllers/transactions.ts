import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { UnauthorizedError } from "../errors.js";

/**
 * GET /api/v1/transactions
 * List user's transaction history
 */
export async function listTransactions(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { type, limit = "50", cursor } = req.query as {
    type?: string;
    limit?: string;
    cursor?: string;
  };

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user.userId,
      ...(type ? { type } : {}),
    },
    take: Math.min(parseInt(limit, 10) || 50, 100),
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: {
      transactions,
      nextCursor:
        transactions.length > 0
          ? transactions[transactions.length - 1].id
          : null,
    },
  });
}

export async function getTransaction(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  const tx = await prisma.transaction.findFirst({
    where: { id, userId: req.user.userId },
  });
  if (!tx) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND" } });
    return;
  }
  res.json({ success: true, data: tx });
}
