import { z } from "zod";

export const threadMessageSchema = z.object({
  id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  textPlain: z.string().optional(),
  textHtml: z.string().optional(),
});

export const threadSummaryPayloadSchema = z.object({
  threadId: z.string(),
  subject: z.string().optional(),
  snippet: z.string().optional(),
  category: z.string().optional(),
  isUnread: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  latestMessageId: z.string().optional(),
  messages: z.array(threadMessageSchema).min(1),
});

export const summaryFiltersSchema = z.object({
  includeCategories: z.array(z.string()).optional(),
  excludeCategories: z.array(z.string()).optional(),
  unreadOnly: z.boolean().optional(),
  importantOnly: z.boolean().optional(),
});

export const summariesRequestSchema = z.object({
  since: z.string().datetime().optional(),
  threads: z.array(threadSummaryPayloadSchema).min(1).max(20),
  filters: summaryFiltersSchema.optional(),
});

export type SummariesRequest = z.infer<typeof summariesRequestSchema>;
export type ThreadSummaryPayload = z.infer<typeof threadSummaryPayloadSchema>;

export const threadSummaryResultSchema = z.object({
  threadId: z.string(),
  threadHeadline: z.string(),
  threadBullets: z.array(z.string()).default([]),
  latestMessageSummary: z.string().optional(),
  actionItems: z.array(z.string()).default([]),
  keyFacts: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ).default([]),
  generatedAt: z.string(),
});

export type ThreadSummaryResult = z.infer<typeof threadSummaryResultSchema>;

export const summariesResponseSchema = z.object({
  summaries: z.array(threadSummaryResultSchema),
  appliedFilters: summaryFiltersSchema.optional(),
  since: z.string().optional(),
});

export type SummariesResponse = z.infer<typeof summariesResponseSchema>;
