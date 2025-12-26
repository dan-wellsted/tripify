import { z } from "zod";

import { activityWithPlaceSchema } from "./activity.js";
import { citySchema } from "./city.js";
import { placeSchema } from "./place.js";

export const itinerarySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const tripDaySchema = z.object({
  id: z.string(),
  itineraryId: z.string(),
  date: z.string().datetime(),
  title: z.string().nullable(),
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createTripDaySchema = z.object({
  date: z.string().datetime(),
  title: z.string().max(200).optional()
});

export const tripDayCitySchema = z.object({
  id: z.string(),
  tripDayId: z.string(),
  cityId: z.string(),
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const tripDayCityWithCitySchema = tripDayCitySchema.extend({
  city: citySchema
});

export const createTripDayCitySchema = z.object({
  cityId: z.string(),
  position: z.number().int().nonnegative().optional()
});

export const tripDayActivitySchema = z.object({
  id: z.string(),
  tripDayId: z.string(),
  activityId: z.string(),
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const tripDayActivityWithActivitySchema = tripDayActivitySchema.extend({
  activity: activityWithPlaceSchema
});

export const createTripDayActivitySchema = z.object({
  activityId: z.string(),
  position: z.number().int().nonnegative().optional()
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1)
});

export const tripDayPlaceSchema = z.object({
  id: z.string(),
  tripDayId: z.string(),
  placeId: z.string(),
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const tripDayPlaceWithPlaceSchema = tripDayPlaceSchema.extend({
  place: placeSchema
});

export const createTripDayPlaceSchema = z.object({
  placeId: z.string(),
  position: z.number().int().nonnegative().optional()
});

export type Itinerary = z.infer<typeof itinerarySchema>;
export type TripDay = z.infer<typeof tripDaySchema>;
export type CreateTripDayInput = z.infer<typeof createTripDaySchema>;
export type TripDayCity = z.infer<typeof tripDayCitySchema>;
export type TripDayCityWithCity = z.infer<typeof tripDayCityWithCitySchema>;
export type CreateTripDayCityInput = z.infer<typeof createTripDayCitySchema>;
export type TripDayActivity = z.infer<typeof tripDayActivitySchema>;
export type TripDayActivityWithActivity = z.infer<
  typeof tripDayActivityWithActivitySchema
>;
export type CreateTripDayActivityInput = z.infer<
  typeof createTripDayActivitySchema
>;
export type ReorderInput = z.infer<typeof reorderSchema>;
export type TripDayPlace = z.infer<typeof tripDayPlaceSchema>;
export type TripDayPlaceWithPlace = z.infer<
  typeof tripDayPlaceWithPlaceSchema
>;
export type CreateTripDayPlaceInput = z.infer<typeof createTripDayPlaceSchema>;
