import { z } from "zod";

const isoDateSchema = z.string().datetime().optional();

function validateDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  ctx: z.RefinementCtx
) {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide both startDate and endDate."
    });
    return;
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getTime() > end.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endDate must be on or after startDate."
      });
    }
  }
}

function validateTimeZones(
  startDate: string | undefined,
  endDate: string | undefined,
  startDateTimeZone: string | undefined,
  endDateTimeZone: string | undefined,
  ctx: z.RefinementCtx
) {
  if (startDate && !startDateTimeZone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide startDateTimeZone when startDate is set."
    });
  }

  if (endDate && !endDateTimeZone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide endDateTimeZone when endDate is set."
    });
  }
}

export const tripSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  groupId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  startDateTimeZone: z.string().nullable(),
  endDateTimeZone: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

const tripInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  startDateTimeZone: z.string().max(64).optional(),
  endDateTimeZone: z.string().max(64).optional()
});

export const createTripSchema = tripInputSchema.superRefine(
  ({ startDate, endDate, startDateTimeZone, endDateTimeZone }, ctx) => {
    validateDateRange(startDate, endDate, ctx);
    validateTimeZones(
      startDate,
      endDate,
      startDateTimeZone,
      endDateTimeZone,
      ctx
    );
  }
);

export const updateTripSchema = tripInputSchema
  .partial()
  .superRefine(
    ({ startDate, endDate, startDateTimeZone, endDateTimeZone }, ctx) => {
    validateDateRange(startDate, endDate, ctx);
      validateTimeZones(
        startDate,
        endDate,
        startDateTimeZone,
        endDateTimeZone,
        ctx
      );
    }
  );

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
