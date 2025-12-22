import { z } from "zod";

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

export type Itinerary = z.infer<typeof itinerarySchema>;
export type TripDay = z.infer<typeof tripDaySchema>;
export type CreateTripDayInput = z.infer<typeof createTripDaySchema>;
