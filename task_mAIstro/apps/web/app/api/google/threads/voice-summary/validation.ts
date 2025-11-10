import { z } from "zod";

export const voiceSummaryQuery = z.object({
  query: z.string().nullish(),
  maxResults: z.coerce.number().max(20).default(5),
  includeCategories: z.coerce.boolean().default(true),
});

export type VoiceSummaryQuery = z.infer<typeof voiceSummaryQuery>;
