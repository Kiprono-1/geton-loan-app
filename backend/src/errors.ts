import { logger } from "./logger.js";
import { config } from "./config.js";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "Unprocessable entity", details?: unknown) {
    super(422, "UNPROCESSABLE_ENTITY", message, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too many requests") {
    super(429, "RATE_LIMITED", message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_ERROR", message);
  }
}

export function errorHandler(
  err: Error,
  req: any,
  res: any,
  _next: any,
): void {
  if (err instanceof HttpError) {
    if (err.status >= 500) {
      logger.error(
        {
          err,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userId: req.user?.userId,
        },
        err.message,
      );
    } else {
      logger.warn(
        {
          err: { code: err.code, message: err.message, status: err.status },
          path: req.path,
          method: req.method,
        },
        "Request error",
      );
    }
    res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unknown error
  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId,
    },
    "Unhandled error",
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: config.isProd
        ? "An unexpected error occurred. Please try again later."
        : err.message,
      // Never expose stack traces, even in dev — use a request ID instead
      requestId: (req as any).id,
    },
  });
}

export function notFoundHandler(req: any, res: any): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Wrap async route handlers to forward errors to Express
 */
export function asyncHandler<T = any>(
  fn: (req: any, res: any, next: any) => Promise<T>,
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
