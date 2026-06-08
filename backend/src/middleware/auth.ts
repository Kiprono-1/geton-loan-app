import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../errors.js";
import type { AuthTokenPayload, UserRole } from "../types.js";

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as AuthTokenPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedError("Missing authorization");
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Invalid authorization scheme");
    }
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [scheme, token] = authHeader.split(" ");
      if (scheme === "Bearer" && token) {
        req.user = verifyToken(token);
      }
    }
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires role: ${roles.join(", ")}`));
    }
    next();
  };
}

export function requireKycLevel(level: 2 | 3) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (req.user.kycLevel < level) {
      return next(
        new ForbiddenError(`Requires KYC tier ${level} (current: ${req.user.kycLevel})`),
      );
    }
    next();
  };
}
