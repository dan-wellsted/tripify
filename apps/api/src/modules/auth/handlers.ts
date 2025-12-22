import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { loginSchema, registerSchema } from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { hashPassword, verifyPassword } from "../../lib/auth.js";
import { sendError } from "../../lib/errors.js";

function sanitizeUser(user: { id: string; email: string; name: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

export async function registerHandler(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { email, password, name } = result.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name ?? null
      }
    });

    req.session.userId = user.id;

    return res.status(201).json({
      user: sanitizeUser(user),
      session: {
        id: req.sessionID
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return sendError(res, 409, "CONFLICT", "Email already in use.");
    }

    return sendError(res, 500, "INTERNAL_ERROR", "Unable to create user.");
  }
}

export async function loginHandler(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  req.session.userId = user.id;

  return res.status(200).json({
    user: sanitizeUser(user),
    session: {
      id: req.sessionID
    }
  });
}

export async function logoutHandler(req: Request, res: Response) {
  return req.session.destroy((error) => {
    if (error) {
      return sendError(res, 500, "INTERNAL_ERROR", "Unable to log out.");
    }

    res.status(204).end();
  });
}

export async function meHandler(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  return res.status(200).json({
    user: sanitizeUser(user)
  });
}
