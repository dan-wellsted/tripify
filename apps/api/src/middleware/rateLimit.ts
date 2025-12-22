import type { NextFunction, Request, Response } from "express";
import { sendError } from "../lib/errors.js";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitState>();

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "rate" } = options;

  return function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip}`;
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return sendError(
        res,
        429,
        "RATE_LIMITED",
        "Too many requests. Please try again later."
      );
    }

    entry.count += 1;
    return next();
  };
}
