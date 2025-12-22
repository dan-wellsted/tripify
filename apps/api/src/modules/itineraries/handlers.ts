import type { Request, Response } from "express";
import {
  createTripDayActivitySchema,
  createTripDayCitySchema,
  createTripDayPlaceSchema,
  createTripDaySchema
} from "@tripplanner/shared";
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

async function requireTripDay(req: Request, res: Response) {
  const trip = await requireTripOwner(req, res);
  if (!trip) {
    return null;
  }

  const day = await prisma.tripDay.findFirst({
    where: {
      id: req.params.dayId,
      itinerary: { tripId: trip.id }
    }
  });

  if (!day) {
    sendError(res, 404, "NOT_FOUND", "Trip day not found.");
    return null;
  }

  return { trip, day };
}

function tripDayPlaceToResponse(dayPlace: {
  id: string;
  tripDayId: string;
  placeId: string;
  position: number;
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
  };
}) {
  return {
    id: dayPlace.id,
    tripDayId: dayPlace.tripDayId,
    placeId: dayPlace.placeId,
    position: dayPlace.position,
    createdAt: dayPlace.createdAt.toISOString(),
    updatedAt: dayPlace.updatedAt.toISOString(),
    place: {
      id: dayPlace.place.id,
      ownerId: dayPlace.place.ownerId,
      name: dayPlace.place.name,
      description: dayPlace.place.description,
      address: dayPlace.place.address,
      latitude: dayPlace.place.latitude,
      longitude: dayPlace.place.longitude,
      createdAt: dayPlace.place.createdAt.toISOString(),
      updatedAt: dayPlace.place.updatedAt.toISOString()
    }
  };
}

function tripDayCityToResponse(dayCity: {
  id: string;
  tripDayId: string;
  cityId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  city: {
    id: string;
    name: string;
    country: string | null;
    region: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  return {
    id: dayCity.id,
    tripDayId: dayCity.tripDayId,
    cityId: dayCity.cityId,
    position: dayCity.position,
    createdAt: dayCity.createdAt.toISOString(),
    updatedAt: dayCity.updatedAt.toISOString(),
    city: {
      id: dayCity.city.id,
      name: dayCity.city.name,
      country: dayCity.city.country,
      region: dayCity.city.region,
      latitude: dayCity.city.latitude,
      longitude: dayCity.city.longitude,
      createdAt: dayCity.city.createdAt.toISOString(),
      updatedAt: dayCity.city.updatedAt.toISOString()
    }
  };
}

function tripDayActivityToResponse(dayActivity: {
  id: string;
  tripDayId: string;
  activityId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  activity: {
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
  };
}) {
  return {
    id: dayActivity.id,
    tripDayId: dayActivity.tripDayId,
    activityId: dayActivity.activityId,
    position: dayActivity.position,
    createdAt: dayActivity.createdAt.toISOString(),
    updatedAt: dayActivity.updatedAt.toISOString(),
    activity: {
      id: dayActivity.activity.id,
      ownerId: dayActivity.activity.ownerId,
      placeId: dayActivity.activity.placeId,
      title: dayActivity.activity.title,
      description: dayActivity.activity.description,
      notes: dayActivity.activity.notes,
      startTime: dayActivity.activity.startTime?.toISOString() ?? null,
      endTime: dayActivity.activity.endTime?.toISOString() ?? null,
      createdAt: dayActivity.activity.createdAt.toISOString(),
      updatedAt: dayActivity.activity.updatedAt.toISOString(),
      place: dayActivity.activity.place
        ? {
            id: dayActivity.activity.place.id,
            ownerId: dayActivity.activity.place.ownerId,
            name: dayActivity.activity.place.name,
            description: dayActivity.activity.place.description,
            address: dayActivity.activity.place.address,
            latitude: dayActivity.activity.place.latitude,
            longitude: dayActivity.activity.place.longitude,
            createdAt: dayActivity.activity.place.createdAt.toISOString(),
            updatedAt: dayActivity.activity.place.updatedAt.toISOString()
          }
        : null
    }
  };
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

export async function listTripDayCitiesHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayCities = await prisma.tripDayCity.findMany({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "asc" },
    include: { city: true }
  });

  return res.status(200).json(dayCities.map(tripDayCityToResponse));
}

export async function addTripDayCityHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const result = createTripDayCitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const { cityId, position } = result.data;

  const city = await prisma.city.findUnique({
    where: { id: cityId }
  });

  if (!city) {
    return sendError(res, 404, "NOT_FOUND", "City not found.");
  }

  const lastCity = await prisma.tripDayCity.findFirst({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "desc" }
  });

  const nextPosition = position ?? (lastCity?.position ?? -1) + 1;

  const dayCity = await prisma.$transaction(async (tx) => {
    if (position !== undefined) {
      await tx.tripDayCity.updateMany({
        where: {
          tripDayId: tripDayContext.day.id,
          position: { gte: position }
        },
        data: { position: { increment: 1 } }
      });
    }

    return tx.tripDayCity.create({
      data: {
        tripDayId: tripDayContext.day.id,
        cityId: city.id,
        position: nextPosition
      },
      include: { city: true }
    });
  });

  return res.status(201).json(tripDayCityToResponse(dayCity));
}

export async function deleteTripDayCityHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayCity = await prisma.tripDayCity.findFirst({
    where: {
      id: req.params.dayCityId,
      tripDayId: tripDayContext.day.id
    }
  });

  if (!dayCity) {
    return sendError(res, 404, "NOT_FOUND", "Day city not found.");
  }

  await prisma.tripDayCity.delete({ where: { id: dayCity.id } });

  return res.status(204).send();
}

export async function listTripDayActivitiesHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayActivities = await prisma.tripDayActivity.findMany({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "asc" },
    include: { activity: { include: { place: true } } }
  });

  return res.status(200).json(dayActivities.map(tripDayActivityToResponse));
}

export async function addTripDayActivityHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const result = createTripDayActivitySchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const userId = req.session.userId as string;
  const { activityId, position } = result.data;

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, ownerId: userId },
    include: { place: true }
  });

  if (!activity) {
    return sendError(res, 404, "NOT_FOUND", "Activity not found.");
  }

  const lastActivity = await prisma.tripDayActivity.findFirst({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "desc" }
  });

  const nextPosition = position ?? (lastActivity?.position ?? -1) + 1;

  const dayActivity = await prisma.$transaction(async (tx) => {
    if (position !== undefined) {
      await tx.tripDayActivity.updateMany({
        where: {
          tripDayId: tripDayContext.day.id,
          position: { gte: position }
        },
        data: { position: { increment: 1 } }
      });
    }

    return tx.tripDayActivity.create({
      data: {
        tripDayId: tripDayContext.day.id,
        activityId: activity.id,
        position: nextPosition
      },
      include: { activity: { include: { place: true } } }
    });
  });

  return res.status(201).json(tripDayActivityToResponse(dayActivity));
}

export async function deleteTripDayActivityHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayActivity = await prisma.tripDayActivity.findFirst({
    where: {
      id: req.params.dayActivityId,
      tripDayId: tripDayContext.day.id
    }
  });

  if (!dayActivity) {
    return sendError(res, 404, "NOT_FOUND", "Day activity not found.");
  }

  await prisma.tripDayActivity.delete({ where: { id: dayActivity.id } });

  return res.status(204).send();
}

export async function listTripDayPlacesHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayPlaces = await prisma.tripDayPlace.findMany({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "asc" },
    include: { place: true }
  });

  return res.status(200).json(dayPlaces.map(tripDayPlaceToResponse));
}

export async function addTripDayPlaceHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const result = createTripDayPlaceSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload.");
  }

  const userId = req.session.userId as string;
  const { placeId, position } = result.data;

  const place = await prisma.place.findFirst({
    where: { id: placeId, ownerId: userId }
  });

  if (!place) {
    return sendError(res, 404, "NOT_FOUND", "Place not found.");
  }

  const lastPlace = await prisma.tripDayPlace.findFirst({
    where: { tripDayId: tripDayContext.day.id },
    orderBy: { position: "desc" }
  });

  const nextPosition = position ?? (lastPlace?.position ?? -1) + 1;

  const dayPlace = await prisma.$transaction(async (tx) => {
    if (position !== undefined) {
      await tx.tripDayPlace.updateMany({
        where: {
          tripDayId: tripDayContext.day.id,
          position: { gte: position }
        },
        data: { position: { increment: 1 } }
      });
    }

    return tx.tripDayPlace.create({
      data: {
        tripDayId: tripDayContext.day.id,
        placeId: place.id,
        position: nextPosition
      },
      include: { place: true }
    });
  });

  return res.status(201).json(tripDayPlaceToResponse(dayPlace));
}

export async function deleteTripDayPlaceHandler(req: Request, res: Response) {
  const tripDayContext = await requireTripDay(req, res);
  if (!tripDayContext) {
    return;
  }

  const dayPlace = await prisma.tripDayPlace.findFirst({
    where: {
      id: req.params.dayPlaceId,
      tripDayId: tripDayContext.day.id
    }
  });

  if (!dayPlace) {
    return sendError(res, 404, "NOT_FOUND", "Day place not found.");
  }

  await prisma.tripDayPlace.delete({ where: { id: dayPlace.id } });

  return res.status(204).send();
}
