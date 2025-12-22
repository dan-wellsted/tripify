import type { Request, Response } from "express";
import { createPlaceSchema, updatePlaceSchema } from "@tripplanner/shared";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";

function placeToResponse(place: {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: place.id,
    ownerId: place.ownerId,
    name: place.name,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString()
  };
}

async function requireUserId(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) {
    sendError(res, 401, "UNAUTHORIZED", "Not authenticated.");
    return null;
  }

  return userId;
}

export async function listPlacesHandler(req: Request, res: Response) {
  const userId = await requireUserId(req, res);
  if (!userId) {
    return;
  }

  const places = await prisma.place.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" }
  });

  return res.status(200).json(places.map(placeToResponse));
}

export async function createPlaceHandler(req: Request, res: Response) {
  const userId = await requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = createPlaceSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { name, description, address, latitude, longitude } = result.data;

  const place = await prisma.place.create({
    data: {
      ownerId: userId,
      name,
      description: description ?? null,
      address: address ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null
    }
  });

  return res.status(201).json(placeToResponse(place));
}

export async function getPlaceHandler(req: Request, res: Response) {
  const userId = await requireUserId(req, res);
  if (!userId) {
    return;
  }

  const place = await prisma.place.findFirst({
    where: { id: req.params.placeId, ownerId: userId }
  });

  if (!place) {
    return sendError(res, 404, "NOT_FOUND", "Place not found.");
  }

  return res.status(200).json(placeToResponse(place));
}

export async function updatePlaceHandler(req: Request, res: Response) {
  const userId = await requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = updatePlaceSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const existing = await prisma.place.findFirst({
    where: { id: req.params.placeId, ownerId: userId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Place not found.");
  }

  const { name, description, address, latitude, longitude } = result.data;
  const updated = await prisma.place.update({
    where: { id: existing.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description: description ?? null } : {}),
      ...(address !== undefined ? { address: address ?? null } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {})
    }
  });

  return res.status(200).json(placeToResponse(updated));
}

export async function deletePlaceHandler(req: Request, res: Response) {
  const userId = await requireUserId(req, res);
  if (!userId) {
    return;
  }

  const existing = await prisma.place.findFirst({
    where: { id: req.params.placeId, ownerId: userId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "Place not found.");
  }

  await prisma.place.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
