import { z } from "zod";
import { userSchema } from "./auth.js";

const groupMemberRoleSchema = z.enum(["owner", "member"]);

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const groupMemberSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  role: groupMemberRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const groupMemberWithUserSchema = groupMemberSchema.extend({
  user: userSchema
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(120)
});

export const addGroupMemberSchema = z.object({
  email: z.string().email(),
  role: groupMemberRoleSchema.optional()
});

export type Group = z.infer<typeof groupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type GroupMemberWithUser = z.infer<typeof groupMemberWithUserSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
