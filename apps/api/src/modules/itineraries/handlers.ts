import type { Request, Response } from "express";
import { createTripDaySchema } from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";

function tripDayToResponse(day: {
  id: string;
  itineraryId: string;
  date: Date;
  title: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: day.id,
    itineraryId: day.itineraryId,
    date: day.date.toISOString(),
    title: day.title,
    position: day.position,
    createdAt: day.createdAt.toISOString(),
    updatedAt: day.updatedAt.toISOString()
  };
}

async function requireTripOwner(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
    return null;
  }

  const trip = await prisma.trip.findFirst({
    where: { id: req.params.tripId, ownerId: userId }
  });

  if (!trip) {
    sendError(res, 404, "NOT_FOUND", "Trip not found.");
    return null;
  }

  return trip;
}

export async function listTripDaysHandler(req: Request, res: Response) {
  const trip = await requireTripOwner(req, res);
  if (!trip) {
    return;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { tripId: trip.id }
  });

  if (!itinerary) {
    return res.status(200).json([]);
  }

  const days = await prisma.tripDay.findMany({
    where: { itineraryId: itinerary.id },
    orderBy: { position: "asc" }
  });

  return res.status(200).json(days.map(tripDayToResponse));
}

export async function createTripDayHandler(req: Request, res: Response) {
  const trip = await requireTripOwner(req, res);
  if (!trip) {
    return;
  }

  const result = createTripDaySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { date, title } = result.data;

  const [itinerary, lastDay] = await prisma.$transaction([
    prisma.itinerary.upsert({
      where: { tripId: trip.id },
      update: {},
      create: { tripId: trip.id }
    }),
    prisma.tripDay.findFirst({
      where: { itinerary: { tripId: trip.id } },
      orderBy: { position: "desc" }
    })
  ]);

  const nextPosition = (lastDay?.position ?? -1) + 1;

  const day = await prisma.tripDay.create({
    data: {
      itineraryId: itinerary.id,
      date: new Date(date),
      title: title ?? null,
      position: nextPosition
    }
  });

  return res.status(201).json(tripDayToResponse(day));
}
