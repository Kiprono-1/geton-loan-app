import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { logger } from "../logger.js";

/**
 * Logs API calls to the audit log for security & compliance.
 * Use on sensitive routes (auth, KYC, payments, loans).
 */
export function audit(action: string, entity?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Capture original end to log after response
    const originalEnd = res.end.bind(res);
    res.end = ((chunk?: any, ...args: any[]) => {
      // Fire-and-forget audit log (don't block response)
      prisma.auditLog
        .create({
          data: {
            userId: req.user?.userId,
            action,
            entity,
            entityId: (req.params as any)?.id,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] as string,
            metadata: JSON.stringify({
              method: req.method,
              path: req.path,
              status: res.statusCode,
              success: res.statusCode < 400,
            }),
          },
        })
        .catch((err) => logger.error({ err }, "Audit log failed"));

      return originalEnd(chunk, ...args);
    }) as typeof res.end;

    next();
  };
}
