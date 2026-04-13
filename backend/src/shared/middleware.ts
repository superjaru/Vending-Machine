import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult } from "express-validator";

// ── Domain error ──────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ── Async wrapper ─────────────────────────────────────────────
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// ── Validation helper ─────────────────────────────────────────
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }
  next();
};

export const errorHandler = (
  err: AppError & { statusCode?: number },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  console.error(err);
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
