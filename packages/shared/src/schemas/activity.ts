import { z } from "zod";

import { placeSchema } from "./place.js";

const isoDateSchema = z.string().datetime().optional();

function validateTimeRange(
  startTime: string | undefined,
  endTime: string | undefined,
  ctx: z.RefinementCtx
) {
  if ((startTime && !endTime) || (!startTime && endTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide both startTime and endTime."
    });
    return;
  }

  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start.getTime() > end.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be on or after startTime."
      });
    }
  }
}

function validateTimeZones(
  startTime: string | undefined,
  endTime: string | undefined,
  startTimeZone: string | undefined,
  endTimeZone: string | undefined,
  ctx: z.RefinementCtx
) {
  if (startTime && !startTimeZone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide startTimeZone when startTime is set."
    });
  }

  if (endTime && !endTimeZone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide endTimeZone when endTime is set."
    });
  }
}

export const activitySchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  placeId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  startTime: z.string().datetime().nullable(),
  endTime: z.string().datetime().nullable(),
  startTimeZone: z.string().nullable(),
  endTimeZone: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const activityWithPlaceSchema = activitySchema.extend({
  place: placeSchema.nullable()
});

const activityInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  startTime: isoDateSchema,
  endTime: isoDateSchema,
  startTimeZone: z.string().max(64).optional(),
  endTimeZone: z.string().max(64).optional(),
  placeId: z.string().optional()
});

export const createActivitySchema = activityInputSchema.superRefine(
  ({ startTime, endTime, startTimeZone, endTimeZone }, ctx) => {
    validateTimeRange(startTime, endTime, ctx);
    validateTimeZones(
      startTime,
      endTime,
      startTimeZone,
      endTimeZone,
      ctx
    );
  }
);

export const updateActivitySchema = activityInputSchema
  .partial()
  .superRefine(({ startTime, endTime, startTimeZone, endTimeZone }, ctx) => {
    validateTimeRange(startTime, endTime, ctx);
    validateTimeZones(
      startTime,
      endTime,
      startTimeZone,
      endTimeZone,
      ctx
    );
  });

export type Activity = z.infer<typeof activitySchema>;
export type ActivityWithPlace = z.infer<typeof activityWithPlaceSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
