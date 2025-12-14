import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * AI batch categorization using gpt-4o-mini (20x cheaper than gpt-4o)
 *
 * Processes 50 emails at once in the background
 * Only used for emails that don't match rule-based patterns (30-40% of emails)
 */

const batchCategorizationSchema = z.object({
  emails: z.array(
    z.object({
      id: z.string(),
      priority: z.enum(["urgent", "important", "normal", "low"]),
      category: z.enum(["urgent", "important", "newsletters", "team", "other"]),
      reasoning: z.string(),
    }),
  ),
});

type EmailForCategorization = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: Date;
};

export type AICategorizedEmail = {
  id: string;
  priority: "urgent" | "important" | "normal" | "low";
  category: "urgent" | "important" | "newsletters" | "team" | "other";
  reasoning: string;
};

/**
 * Categorize a batch of emails using gpt-4o-mini
 * Processes up to 50 emails at once for efficiency
 */
export async function categorizeEmailsWithAI(
  emails: EmailForCategorization[],
): Promise<AICategorizedEmail[]> {
  if (emails.length === 0) return [];

  // Limit batch size to 50 for optimal performance
  const batch = emails.slice(0, 50);

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"), // 20x cheaper than gpt-4o
      schema: batchCategorizationSchema,
      prompt: `You are categorizing emails to help users focus on what matters.

PRIORITY LEVELS:
- "urgent": Immediate action needed (security alerts, deadlines, emergencies, expiring offers)
- "important": Needs attention soon (bills, account notices, work emails, personal emails from real people)
- "normal": Can wait (regular correspondence, updates, confirmations)
- "low": Not important (marketing, promotions, newsletters, spam)

CATEGORIES:
- "urgent": Security threats, emergencies, critical deadlines
- "important": Work/personal emails, bills, account notices
- "newsletters": Email lists, marketing, promotions
- "team": Work collaboration (if identifiable from sender/content)
- "other": Everything else

ANALYZE THESE ${batch.length} EMAILS:
${batch.map((e, i) => `
${i + 1}. ID: ${e.id}
   From: ${e.from}
   Date: ${e.date.toISOString()}
   Subject: ${e.subject}
   Preview: ${e.snippet.substring(0, 250)}
`).join("\n")}

For each email:
1. Determine priority based on CONTENT and URGENCY
2. Assign appropriate category
3. Explain reasoning in ONE concise sentence

EXAMPLES:
- "Your Xfinity bill is ready" → important/important (bill needs payment)
- "Meeting tomorrow at 2pm" → important/team (upcoming meeting)
- "50% off sale this weekend" → low/newsletters (marketing spam)
- "Password reset requested" → urgent/urgent (security threat)
- "Your friend sent you a message" → important/important (personal communication)
- "Weekly newsletter from TechCrunch" → low/newsletters (news digest)

Return priority, category, and reasoning for EVERY email.`,
    });

    // Map AI results back to our format
    return object.emails.map((result) => ({
      id: result.id,
      priority: result.priority,
      category: result.category,
      reasoning: result.reasoning,
    }));
  } catch (error) {
    console.error("AI categorization batch failed:", error);

    // Fallback: mark all as normal/other if AI fails
    return batch.map((email) => ({
      id: email.id,
      priority: "normal" as const,
      category: "other" as const,
      reasoning: "Categorization failed - marked as normal",
    }));
  }
}

/**
 * Process multiple batches of emails (chunked into groups of 50)
 * Returns all categorized emails
 */
export async function categorizeEmailsInBatches(
  emails: EmailForCategorization[],
  batchSize = 50,
): Promise<AICategorizedEmail[]> {
  const results: AICategorizedEmail[] = [];

  // Process in batches
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const categorized = await categorizeEmailsWithAI(batch);
    results.push(...categorized);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
