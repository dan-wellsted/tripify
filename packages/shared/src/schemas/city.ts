import { z } from "zod";

const latitudeSchema = z.number().min(-90).max(90);
const longitudeSchema = z.number().min(-180).max(180);

export const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const createCitySchema = z.object({
  name: z.string().min(1).max(200),
  country: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional()
});

export const updateCitySchema = createCitySchema.partial();

export type City = z.infer<typeof citySchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
