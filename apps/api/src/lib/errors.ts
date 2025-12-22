import type { Response } from "express";

export type ErrorCode =
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "INVALID_CREDENTIALS"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

export function sendError(
  res: Response,
  status: number,
  code: ErrorCode,
  message: string
) {
  return res.status(status).json({
    error: {
      code,
      message
    }
  });
}
