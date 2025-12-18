import { z } from "zod";

export const voiceSummaryQuery = z.object({
  query: z.string().nullish(),
  maxResults: z.coerce.number().max(1000).default(50), // Increased: default 50, max 1000
  includeCategories: z.coerce.boolean().default(true),
  fromEmail: z.string().nullish(), // Add sender email filter
});

export type VoiceSummaryQuery = z.infer<typeof voiceSummaryQuery>;
