import type { gmail_v1 } from "@googleapis/gmail";
import { getThreadsWithNextPageToken } from "@/utils/gmail/thread";
import type { VoiceSummaryQuery } from "./validation";
import { decodeSnippet } from "@/utils/gmail/decode";
import { categorizeThreadsByPriority } from "@/utils/ai/voice/categorize-threads";
import { GmailLabel } from "@/utils/gmail/label";
import { parseNaturalLanguageQuery } from "@/utils/gmail/query-parser";

export type VoiceSummaryResponse = Awaited<
  ReturnType<typeof getVoiceSummary>
>;

export async function getVoiceSummary({
  query,
  gmail,
  accessToken,
}: {
  query: VoiceSummaryQuery;
  gmail: gmail_v1.Gmail;
  accessToken: string;
}) {
  try {
    // Parse natural language queries like "today" into Gmail syntax
    const parsedQuery = query.query
      ? parseNaturalLanguageQuery(query.query)
      : undefined;

    console.log("Voice summary query:", { original: query.query, parsed: parsedQuery, maxResults: query.maxResults });

    // Step 1: Get thread IDs matching query (lightweight)
    // Fetch more threads than requested so we can categorize and return the top ones
    const fetchLimit = Math.min(100, (query.maxResults || 5) * 10);

    const { threads: gmailThreads, nextPageToken, resultSizeEstimate } =
      await getThreadsWithNextPageToken({
        gmail,
        q: parsedQuery,
        maxResults: fetchLimit,
      });

    console.log("Gmail response:", {
      threadsCount: gmailThreads?.length,
      resultSizeEstimate,
      hasNextPage: !!nextPageToken
    });

  // Use Gmail's estimate for total count
  const totalMatches = resultSizeEstimate || gmailThreads?.length || 0;

  if (totalMatches === 0) {
    return {
      summary: {
        totalMatches: 0,
        query: query.query || "",
        categories: {
          urgent: 0,
          important: 0,
          newsletters: 0,
          team: 0,
          other: 0,
        },
      },
      topPriority: [],
      hasMore: false,
    };
  }

  // Step 2: Fetch thread data with full metadata
  // We need to fetch each thread individually to get headers + snippet
  const threadsWithMetadata = await Promise.all(
    gmailThreads.slice(0, 20).map(async (thread) => {
      if (!thread.id) return null;

      try {
        const fullThread = await gmail.users.threads.get({
          userId: "me",
          id: thread.id,
          format: "full", // full format includes everything we need
        });

        const firstMessage = fullThread.data.messages?.[0];
        if (!firstMessage) return null;

        const headers = firstMessage.payload?.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "Unknown";
        const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
        const dateStr = headers.find((h) => h.name === "Date")?.value || new Date().toISOString();
        const labelIds = firstMessage.labelIds || [];

        return {
          id: thread.id,
          snippet: decodeSnippet(firstMessage.snippet || ""),
          from,
          subject,
          timestamp: Date.parse(dateStr),
          labelIds,
          unread: labelIds.includes(GmailLabel.UNREAD),
        };
      } catch (error) {
        console.error(`Error fetching thread ${thread.id}:`, error);
        return null;
      }
    }),
  );

  const validThreads = threadsWithMetadata.filter(
    (t): t is NonNullable<typeof t> => t !== null,
  );

  // Step 3: AI categorization (fast, uses snippets and metadata only)
  let categorized;
  try {
    categorized = query.includeCategories
      ? await categorizeThreadsByPriority(validThreads)
      : validThreads.map((t) => ({
          ...t,
          priority: "normal" as const,
          category: "other" as const,
        }));
    console.log("Categorization complete:", categorized.length, "threads");
  } catch (error) {
    console.error("Categorization failed, falling back to no categorization:", error);
    // Fallback: skip categorization if it fails
    categorized = validThreads.map((t) => ({
      ...t,
      priority: "normal" as const,
      category: "other" as const,
    }));
  }

  // Step 4: Return voice-optimized response
  const topPriority = categorized.slice(0, query.maxResults).map((t) => ({
    id: t.id,
    subject: t.subject,
    from: t.from,
    snippet: t.snippet.substring(0, 150), // Truncate for voice
    timestamp: t.timestamp,
    unread: t.unread,
    priority: t.priority,
  }));

  // Calculate category counts
  const categories = categorized.reduce(
    (acc, t) => {
      if (t.category === "urgent") acc.urgent++;
      else if (t.category === "important") acc.important++;
      else if (t.category === "newsletters") acc.newsletters++;
      else if (t.category === "team") acc.team++;
      else acc.other++;
      return acc;
    },
    { urgent: 0, important: 0, newsletters: 0, team: 0, other: 0 },
  );

  return {
    summary: {
      totalMatches,
      query: query.query || "",
      categories,
    },
    topPriority,
    hasMore: totalMatches > query.maxResults,
    nextPageToken,
  };
  } catch (error) {
    console.error("Error in getVoiceSummary:", error);
    throw error;
  }
}
