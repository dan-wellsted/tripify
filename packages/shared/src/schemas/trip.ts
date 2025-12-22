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

export const tripSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

const tripInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: isoDateSchema,
  endDate: isoDateSchema
});

export const createTripSchema = tripInputSchema.superRefine(
  ({ startDate, endDate }, ctx) => {
    validateDateRange(startDate, endDate, ctx);
  }
);

export const updateTripSchema = tripInputSchema
  .partial()
  .superRefine(({ startDate, endDate }, ctx) => {
    validateDateRange(startDate, endDate, ctx);
  });

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
