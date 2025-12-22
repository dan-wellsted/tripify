import { z } from "zod";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const userSchema = z.object({
  id: z.string(),
  email: emailSchema,
  name: z.string().nullable()
});

export const sessionSchema = z.object({
  id: z.string()
});

export const authResponseSchema = z.object({
  user: userSchema,
  session: sessionSchema
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof sessionSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
