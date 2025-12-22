import type { Request, Response } from "express";
import { createCitySchema, updateCitySchema } from "@tripplanner/shared";
import { Prisma } from "@prisma/client";
import prisma from "../../lib/db.js";
import { sendError } from "../../lib/errors.js";

function cityToResponse(city: {
  id: string;
  name: string;
  country: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    region: city.region,
    latitude: city.latitude,
    longitude: city.longitude,
    createdAt: city.createdAt.toISOString(),
    updatedAt: city.updatedAt.toISOString()
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

export async function listCitiesHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" }
  });

  return res.status(200).json(cities.map(cityToResponse));
}

export async function createCityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = createCitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { name, country, region, latitude, longitude } = result.data;

  try {
    const city = await prisma.city.create({
      data: {
        name,
        country: country ?? null,
        region: region ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null
      }
    });

    return res.status(201).json(cityToResponse(city));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendError(res, 409, "CONFLICT", "City already exists.");
    }
    throw error;
  }
}

export async function getCityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const city = await prisma.city.findUnique({
    where: { id: req.params.cityId }
  });

  if (!city) {
    return sendError(res, 404, "NOT_FOUND", "City not found.");
  }

  return res.status(200).json(cityToResponse(city));
}

export async function updateCityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const result = updateCitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const existing = await prisma.city.findUnique({
    where: { id: req.params.cityId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "City not found.");
  }

  const { name, country, region, latitude, longitude } = result.data;

  try {
    const updated = await prisma.city.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(country !== undefined ? { country: country ?? null } : {}),
        ...(region !== undefined ? { region: region ?? null } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {})
      }
    });

    return res.status(200).json(cityToResponse(updated));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return sendError(res, 409, "CONFLICT", "City already exists.");
    }
    throw error;
  }
}

export async function deleteCityHandler(req: Request, res: Response) {
  const userId = requireUserId(req, res);
  if (!userId) {
    return;
  }

  const existing = await prisma.city.findUnique({
    where: { id: req.params.cityId }
  });

  if (!existing) {
    return sendError(res, 404, "NOT_FOUND", "City not found.");
  }

  await prisma.city.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
