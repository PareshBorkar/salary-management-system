import { z } from "zod";

export const taxSlabsQuerySchema = z.object({
  country: z.literal("IN").default("IN"),
  regime: z.literal("NEW").default("NEW"),
  assessmentYear: z.literal("2026-27").default("2026-27"),
  amount: z.coerce.number().nonnegative().optional()
});
