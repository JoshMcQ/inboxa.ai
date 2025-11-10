import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const categorizationSchema = z.object({
  threads: z.array(
    z.object({
      id: z.string(),
      priority: z.enum(["urgent", "important", "normal", "low"]),
      category: z.enum(["urgent", "important", "newsletters", "team", "other"]),
      reasoning: z.string().optional(),
    }),
  ),
});

type ThreadInput = {
  id: string;
  snippet: string;
  from: string;
  subject: string;
  timestamp: number;
  unread: boolean;
};

type CategorizedThread = ThreadInput & {
  priority: "urgent" | "important" | "normal" | "low";
  category: "urgent" | "important" | "newsletters" | "team" | "other";
};

export async function categorizeThreadsByPriority(
  threads: ThreadInput[],
): Promise<CategorizedThread[]> {
  if (threads.length === 0) return [];

  // Quick heuristic filtering for obvious cases
  const withHeuristics = threads.map((t) => {
    const from = t.from.toLowerCase();
    const subject = t.subject.toLowerCase();

    // Heuristics for common patterns
    const isNewsletter =
      from.includes("no-reply") ||
      from.includes("noreply") ||
      from.includes("newsletter") ||
      from.includes("notifications@") ||
      from.includes("news@");

    const isUrgent =
      subject.includes("urgent") ||
      subject.includes("asap") ||
      subject.includes("immediate") ||
      subject.includes("action required");

    const isMarketing =
      subject.includes("unsubscribe") ||
      subject.includes("offer") ||
      subject.includes("discount") ||
      subject.includes("sale");

    // Determine heuristic priority
    let heuristicPriority: "urgent" | "important" | "normal" | "low";
    let heuristicCategory: "urgent" | "important" | "newsletters" | "team" | "other";

    if (isUrgent) {
      heuristicPriority = "urgent";
      heuristicCategory = "urgent";
    } else if (isNewsletter || isMarketing) {
      heuristicPriority = "low";
      heuristicCategory = "newsletters";
    } else {
      heuristicPriority = "normal";
      heuristicCategory = "other";
    }

    return {
      ...t,
      isNewsletter,
      isUrgent,
      isMarketing,
      heuristicPriority,
      heuristicCategory,
    };
  });

  // Separate obvious newsletters from threads that need AI analysis
  const newsletters = withHeuristics.filter(
    (t) => t.isNewsletter || t.isMarketing,
  );
  const needsAI = withHeuristics.filter(
    (t) => !t.isNewsletter && !t.isMarketing,
  );

  // If all are newsletters, return heuristics only
  if (needsAI.length === 0) {
    return withHeuristics.map((t) => ({
      id: t.id,
      snippet: t.snippet,
      from: t.from,
      subject: t.subject,
      timestamp: t.timestamp,
      unread: t.unread,
      priority: t.heuristicPriority,
      category: t.heuristicCategory,
    }));
  }

  // Use AI only for non-newsletter threads (max 20)
  const threadsForAI = needsAI.slice(0, 20);

  try {
    // AI categorization for important threads
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"), // Fast, cheap model
      schema: categorizationSchema,
      prompt: `Categorize these emails by priority and type.
Return them sorted by priority (urgent first, low last).

Emails:
${threadsForAI
  .map(
    (t, i) => `
${i + 1}. ID: ${t.id}
   From: ${t.from}
   Subject: ${t.subject}
   Snippet: ${t.snippet.substring(0, 100)}
   Unread: ${t.unread}
`,
  )
  .join("\n")}

Categories:
- urgent: Time-sensitive, requires immediate action (within 24 hours)
- important: Important but not urgent (within this week)
- newsletters: Marketing, updates, subscriptions (already filtered, should be rare)
- team: Internal team communication
- other: Everything else

Priority levels:
- urgent: Requires action within 24 hours
- important: Requires action this week
- normal: Can wait, but should read
- low: FYI, newsletters, low priority

Return results sorted by priority (urgent first).`,
    });

    // Merge AI results with heuristics
    const aiCategorized = object.threads.map((aiThread) => {
      const original = threadsForAI.find((t) => t.id === aiThread.id)!;
      return {
        id: aiThread.id,
        snippet: original.snippet,
        from: original.from,
        subject: original.subject,
        timestamp: original.timestamp,
        unread: original.unread,
        priority: aiThread.priority,
        category: aiThread.category,
      };
    });

    // Add back newsletters with low priority
    const newsletterResults = newsletters.map((t) => ({
      id: t.id,
      snippet: t.snippet,
      from: t.from,
      subject: t.subject,
      timestamp: t.timestamp,
      unread: t.unread,
      priority: "low" as const,
      category: "newsletters" as const,
    }));

    // Combine and sort by priority
    const allResults = [...aiCategorized, ...newsletterResults];
    return sortByPriority(allResults);
  } catch (error) {
    console.error("Error in AI categorization, falling back to heuristics:", error);

    // Fallback to heuristics only if AI fails
    return withHeuristics.map((t) => ({
      id: t.id,
      snippet: t.snippet,
      from: t.from,
      subject: t.subject,
      timestamp: t.timestamp,
      unread: t.unread,
      priority: t.heuristicPriority,
      category: t.heuristicCategory,
    }));
  }
}

function sortByPriority(threads: CategorizedThread[]): CategorizedThread[] {
  const priorityOrder = { urgent: 0, important: 1, normal: 2, low: 3 };

  return threads.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by timestamp (newest first)
    return b.timestamp - a.timestamp;
  });
}
