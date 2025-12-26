import type { Request, Response } from "express";
import {
  createTripSchema,
  updateTripSchema
} from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";
import { ensureItineraryDays } from "./helpers.js";

function getUserId(req: Request) {
  return req.session.userId;
}

async function canAccessTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { ownerId: userId },
        { group: { members: { some: { userId } } } }
      ]
    }
  });
}

function tripToResponse(trip: {
  id: string;
  ownerId: string;
  groupId: string | null;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  startDateTimeZone: string | null;
  endDateTimeZone: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: trip.id,
    ownerId: trip.ownerId,
    groupId: trip.groupId,
    title: trip.title,
    description: trip.description,
    startDate: trip.startDate ? trip.startDate.toISOString() : null,
    endDate: trip.endDate ? trip.endDate.toISOString() : null,
    startDateTimeZone: trip.startDateTimeZone,
    endDateTimeZone: trip.endDateTimeZone,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString()
  };
}

export async function createTripHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    // Session may be stale; clear it and treat as unauthenticated.
    req.session.userId = undefined;
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const result = createTripSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const {
    title,
    description,
    startDate,
    endDate,
    startDateTimeZone,
    endDateTimeZone
  } = result.data;
  if ((startDate && !endDate) || (!startDate && endDate)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Provide both startDate and endDate.");
  }
  const trip = await prisma.trip.create({
    data: {
      ownerId: userId,
      title,
      description: description ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      startDateTimeZone: startDateTimeZone ?? null,
      endDateTimeZone: endDateTimeZone ?? null
    }
  });

  if (trip.startDate && trip.endDate) {
    await ensureItineraryDays({
      tripId: trip.id,
      startDate: trip.startDate,
      endDate: trip.endDate
    });
  }

  return res.status(201).json(tripToResponse(trip));
}

export async function listTripsHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { group: { members: { some: { userId } } } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  return res.status(200).json(trips.map(tripToResponse));
}

export async function getTripHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const trip = await canAccessTrip(req.params.tripId, userId);

  if (!trip) {
    return sendError(res, 404, "NOT_FOUND", "Trip not found.");
  }

  return res.status(200).json(tripToResponse(trip));
}

export async function updateTripHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const result = updateTripSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const existing = await canAccessTrip(req.params.tripId, userId);

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Trip not found.");
  }

  const {
    title,
    description,
    startDate,
    endDate,
    startDateTimeZone,
    endDateTimeZone,
    groupId
  } = result.data;
  if ((startDate && !endDate) || (!startDate && endDate)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Provide both startDate and endDate.");
  }

  if (groupId !== undefined) {
    if (existing.ownerId !== userId) {
      return sendError(res, 403, "FORBIDDEN", "Not authorized.");
    }

    if (groupId !== null) {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      if (!group) {
        return sendError(res, 404, "NOT_FOUND", "Group not found.");
      }
    }
  }

  const updated = await prisma.trip.update({
    where: { id: existing.id },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      endDate: endDate ? new Date(endDate) : existing.endDate,
      startDateTimeZone: startDateTimeZone ?? existing.startDateTimeZone,
      endDateTimeZone: endDateTimeZone ?? existing.endDateTimeZone,
      ...(groupId !== undefined ? { groupId } : {})
    }
  });

  if (startDate || endDate) {
    if (updated.startDate && updated.endDate) {
      await ensureItineraryDays({
        tripId: updated.id,
        startDate: updated.startDate,
        endDate: updated.endDate
      });
    }
  }

  return res.status(200).json(tripToResponse(updated));
}

export async function deleteTripHandler(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) {
    return sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
  }

  const existing = await canAccessTrip(req.params.tripId, userId);

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Trip not found.");
  }

  await prisma.trip.delete({
    where: { id: existing.id }
  });

  return res.status(204).end();
}
