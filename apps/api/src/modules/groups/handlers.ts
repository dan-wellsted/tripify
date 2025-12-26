import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  addGroupMemberSchema,
  createGroupSchema
} from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";

function requireUserId(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
    return null;
  }

  return userId;
}

function groupToResponse(group: {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: group.id,
    name: group.name,
    ownerId: group.ownerId,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString()
  };
}

function groupMemberToResponse(member: {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}) {
  return {
    id: member.id,
    groupId: member.groupId,
    userId: member.userId,
    role: member.role,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    ...(member.user
      ? {
          user: {
            id: member.user.id,
            email: member.user.email,
            name: member.user.name
          }
        }
      : {})
  };
}

export async function listGroupsHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    orderBy: { name: "asc" }
  });

  return res.status(200).json(groups.map(groupToResponse));
}

export async function createGroupHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = createGroupSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { name } = result.data;

  const group = await prisma.group.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "owner"
        }
      }
    }
  });

  return res.status(201).json(groupToResponse(group));
}

export async function listGroupMembersHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const group = await prisma.group.findFirst({
    where: {
      id: req.params.groupId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: {
      members: {
        include: {
          user: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!group) {
    return sendError(res, 404, "NOT_FOUND", "Group not found.");
  }

  return res
    .status(200)
    .json(group.members.map(groupMemberToResponse));
}

export async function addGroupMemberHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = addGroupMemberSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  if (result.data.role === "owner") {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Owner role cannot be assigned."
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: req.params.groupId }
  });

  if (!group) {
    return sendError(res, 404, "NOT_FOUND", "Group not found.");
  }

  if (group.ownerId !== userId) {
    return sendError(res, 403, "FORBIDDEN", "Not authorized.");
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email }
  });

  if (!user) {
    return sendError(res, 404, "NOT_FOUND", "User not found.");
  }

  try {
    const member = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: "member"
      },
      include: {
        user: true
      }
    });

    return res.status(201).json(groupMemberToResponse(member));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendError(res, 409, "CONFLICT", "User already in group.");
    }
    throw error;
  }
}

export async function deleteGroupMemberHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const member = await prisma.groupMember.findUnique({
    where: { id: req.params.memberId },
    include: {
      group: true
    }
  });

  if (!member || member.groupId !== req.params.groupId) {
    return sendError(res, 404, "NOT_FOUND", "Member not found.");
  }

  const isOwner = member.group.ownerId === userId;
  const isSelf = member.userId === userId;

  if (!isOwner && !isSelf) {
    return sendError(res, 403, "FORBIDDEN", "Not authorized.");
  }

  if (member.role === "owner") {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Group owner cannot be removed."
    );
  }

  await prisma.groupMember.delete({
    where: { id: member.id }
  });

  return res.status(204).send();
}
