import type { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { UnprocessableEntityError } from "../errors.js";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with validated (and possibly transformed) data
      (req as any)[source] = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
          code: e.code,
        }));
        return next(
          new UnprocessableEntityError("Validation failed", details),
        );
      }
      next(err);
    }
  };
}

export { z };
