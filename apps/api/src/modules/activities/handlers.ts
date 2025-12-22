import type { Request, Response } from "express";
import { createActivitySchema, updateActivitySchema } from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";

function activityToResponse(activity: {
  id: string;
  ownerId: string;
  placeId: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  place: {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}) {
  return {
    id: activity.id,
    ownerId: activity.ownerId,
    placeId: activity.placeId,
    title: activity.title,
    description: activity.description,
    notes: activity.notes,
    startTime: activity.startTime?.toISOString() ?? null,
    endTime: activity.endTime?.toISOString() ?? null,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
    place: activity.place
      ? {
          id: activity.place.id,
          ownerId: activity.place.ownerId,
          name: activity.place.name,
          description: activity.place.description,
          address: activity.place.address,
          latitude: activity.place.latitude,
          longitude: activity.place.longitude,
          createdAt: activity.place.createdAt.toISOString(),
          updatedAt: activity.place.updatedAt.toISOString()
        }
      : null
  };
}

function requireUserId(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
    return null;
  }

  return userId;
}

async function resolvePlace(userId: string, placeId?: string) {
  if (!placeId) {
    return null;
  }

  return prisma.place.findFirst({
    where: { id: placeId, ownerId: userId }
  });
}

export async function listActivitiesHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const activities = await prisma.activity.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: { place: true }
  });

  return res.status(200).json(activities.map(activityToResponse));
}

export async function createActivityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = createActivitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { title, description, notes, startTime, endTime, placeId } =
    result.data;

  const place = await resolvePlace(userId, placeId);
  if (placeId && !place) {
    return sendError(res, 404, "NOT_FOUND", "Place not found.");
  }

  const activity = await prisma.activity.create({
    data: {
      ownerId: userId,
      title,
      description: description ?? null,
      notes: notes ?? null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      placeId: place?.id ?? null
    },
    include: { place: true }
  });

  return res.status(201).json(activityToResponse(activity));
}

export async function getActivityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const activity = await prisma.activity.findFirst({
    where: { id: req.params.activityId, ownerId: userId },
    include: { place: true }
  });

  if (!activity) {
    return sendError(res, 404, "NOT_FOUND", "Activity not found.");
  }

  return res.status(200).json(activityToResponse(activity));
}

export async function updateActivityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = updateActivitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const existing = await prisma.activity.findFirst({
    where: { id: req.params.activityId, ownerId: userId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Activity not found.");
  }

  const { title, description, notes, startTime, endTime, placeId } =
    result.data;

  let place = null;
  if (placeId !== undefined) {
    place = await resolvePlace(userId, placeId);
    if (placeId && !place) {
      return sendError(res, 404, "NOT_FOUND", "Place not found.");
    }
  }

  const updated = await prisma.activity.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description: description ?? null } : {}),
      ...(notes !== undefined ? { notes: notes ?? null } : {}),
      ...(startTime !== undefined
        ? { startTime: startTime ? new Date(startTime) : null }
        : {}),
      ...(endTime !== undefined
        ? { endTime: endTime ? new Date(endTime) : null }
        : {}),
      ...(placeId !== undefined ? { placeId: place?.id ?? null } : {})
    },
    include: { place: true }
  });

  return res.status(200).json(activityToResponse(updated));
}

export async function deleteActivityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const existing = await prisma.activity.findFirst({
    where: { id: req.params.activityId, ownerId: userId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Activity not found.");
  }

  await prisma.activity.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
