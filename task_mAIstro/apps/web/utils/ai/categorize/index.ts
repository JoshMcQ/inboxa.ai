/**
 * Combined email categorization system
 *
 * Two-stage approach:
 * 1. Rule-based (free, instant) - handles 60-70% of emails
 * 2. AI batch (gpt-4o-mini) - handles remaining 30-40%
 */

import { categorizeWithRules, batchCategorizeWithRules } from "./rule-based";
import { categorizeEmailsWithAI, type AICategorizedEmail } from "./ai-batch";

export type EmailToCategorize = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: Date;
};

export type CategorizedEmail = EmailToCategorize & {
  priority: "urgent" | "important" | "normal" | "low";
  category: "urgent" | "important" | "newsletters" | "team" | "other";
  reasoning: string;
  categorizationMethod: "rule-based" | "ai";
};

/**
 * Categorize a batch of emails using both rules and AI
 *
 * @param emails - Emails to categorize
 * @param useAI - Whether to use AI for uncategorized emails (default: true)
 * @returns Array of categorized emails
 */
export async function categorizeEmails(
  emails: EmailToCategorize[],
  useAI = true,
): Promise<CategorizedEmail[]> {
  if (emails.length === 0) return [];

  // Stage 1: Apply rule-based categorization (free & instant)
  const { categorized: ruleBased, needsAI } = batchCategorizeWithRules(emails);

  // Convert rule-based results to final format
  const ruleBasedResults: CategorizedEmail[] = ruleBased.map((email) => ({
    id: email.id,
    from: email.from,
    subject: email.subject,
    snippet: email.snippet,
    date: emails.find((e) => e.id === email.id)?.date || new Date(),
    priority: email.priority!,
    category: email.category!,
    reasoning: email.reasoning!,
    categorizationMethod: "rule-based" as const,
  }));

  console.log(
    `Categorization: ${ruleBasedResults.length}/${emails.length} emails categorized by rules (${Math.round((ruleBasedResults.length / emails.length) * 100)}%)`,
  );

  // Stage 2: AI categorization for remaining emails (if enabled)
  if (!useAI || needsAI.length === 0) {
    console.log(`Skipping AI categorization for ${needsAI.length} emails`);
    return ruleBasedResults;
  }

  console.log(
    `AI categorization: Processing ${needsAI.length} emails with gpt-4o-mini`,
  );

  const emailsForAI = needsAI.map((email) => {
    const fullEmail = emails.find((e) => e.id === email.id);
    return {
      id: email.id,
      from: email.from,
      subject: email.subject,
      snippet: email.snippet,
      date: fullEmail?.date || new Date(),
    };
  });

  const aiResults = await categorizeEmailsWithAI(emailsForAI);

  const aiCategorized: CategorizedEmail[] = aiResults.map((result) => {
    const original = emailsForAI.find((e) => e.id === result.id)!;
    return {
      ...original,
      priority: result.priority,
      category: result.category,
      reasoning: result.reasoning,
      categorizationMethod: "ai" as const,
    };
  });

  console.log(`AI categorization completed: ${aiCategorized.length} emails`);

  // Combine results
  return [...ruleBasedResults, ...aiCategorized];
}

/**
 * Categorize a single email (convenience function)
 */
export async function categorizeEmail(
  email: EmailToCategorize,
  useAI = true,
): Promise<CategorizedEmail> {
  const results = await categorizeEmails([email], useAI);
  return results[0];
}

/**
 * Export individual categorizers for direct use
 */
export { categorizeWithRules } from "./rule-based";
export { categorizeEmailsWithAI } from "./ai-batch";
