import type { gmail_v1 } from "@googleapis/gmail";
import prisma from "@/utils/prisma";
import type { VoiceSummaryQuery } from "./validation";
import { parseNaturalLanguageQuery } from "@/utils/gmail/query-parser";
import { getGmailClientForEmail } from "@/utils/account";
import { parseMessage } from "@/utils/mail";
import { internalDateToDate } from "@/utils/date";

export type VoiceSummaryResponse = Awaited<
  ReturnType<typeof getVoiceSummary>
>;

/**
 * HYBRID ARCHITECTURE: Gmail API + Cached Categorizations
 *
 * Benefits:
 * - Always fresh data (queries Gmail directly)
 * - No database bloat (only stores categorization metadata)
 * - Fast categorization lookups (cached in database)
 * - Scalable (no need to sync entire inbox)
 */
export async function getVoiceSummary({
  query,
  emailAccountId,
}: {
  query: VoiceSummaryQuery;
  emailAccountId: string;
}) {
  try {
    const startTime = Date.now();

    // Get Gmail client
    const gmail = await getGmailClientForEmail({ emailAccountId });

    // Build Gmail search query using the parser
    const parsedQuery = query.query
      ? parseNaturalLanguageQuery(query.query)
      : "in:inbox";

    // Add sender filter if provided
    let gmailQuery = parsedQuery;
    if (query.fromEmail) {
      gmailQuery += ` from:${query.fromEmail}`;
    }

    console.log("Gmail search query:", gmailQuery);

    // Query Gmail API with smart pagination limits
    // Don't fetch more than we need to avoid rate limits
    const MAX_MESSAGES_TO_FETCH = Math.min(query.maxResults * 3, 300); // Cap at 300
    let allMessages: gmail_v1.Schema$Message[] = [];
    let pageToken: string | undefined;
    let totalResultSize = 0;

    do {
      const gmailResponse = await gmail.users.messages.list({
        userId: "me",
        q: gmailQuery,
        maxResults: 100,
        pageToken,
      });

      const newMessages = gmailResponse.data.messages || [];
      allMessages = allMessages.concat(newMessages);

      // Track total results from Gmail
      if (gmailResponse.data.resultSizeEstimate) {
        totalResultSize = gmailResponse.data.resultSizeEstimate;
      }

      pageToken = gmailResponse.data.nextPageToken || undefined;

      // Stop if we have enough messages
      if (allMessages.length >= MAX_MESSAGES_TO_FETCH) {
        break;
      }
    } while (pageToken);

    const messages = allMessages;
    const totalMatches = totalResultSize || messages.length;

    if (messages.length === 0) {
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

    console.log(`Gmail returned ${messages.length} messages`);

    // Get categorizations from database (cached metadata only)
    const messageIds = messages.map((m) => m.id!);
    const categorizations = await prisma.emailCategorization.findMany({
      where: {
        emailAccountId,
        messageId: { in: messageIds },
      },
      select: {
        messageId: true,
        priority: true,
        category: true,
        reasoning: true,
      },
    });

    const categorizationMap = new Map(
      categorizations.map((c) => [c.messageId, c])
    );

    console.log(
      `Found ${categorizations.length} cached categorizations out of ${messages.length} messages`
    );

    // OPTIMIZATION: Only fetch full details for top N*2 messages
    // This prevents rate limiting when user has hundreds of emails
    const maxToFetch = Math.min(messages.length, query.maxResults * 2);
    const messagesToFetch = messages.slice(0, maxToFetch);

    console.log(`Fetching full details for ${messagesToFetch.length} out of ${messages.length} messages`);

    // Fetch full message details from Gmail and combine with categorizations
    const emailsWithDetails = (
      await Promise.all(
        messagesToFetch.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "full",
          });

          if (!fullMessage.data.payload) return null;
          const parsed = parseMessage(fullMessage.data as any);
          const categorization = categorizationMap.get(msg.id!);

          return {
            messageId: msg.id!,
            threadId: parsed.threadId || msg.id!,
            subject: parsed.headers.subject || "(No subject)",
            from: parsed.headers.from,
            snippet: parsed.snippet || "",
            date: internalDateToDate(parsed.internalDate) || new Date(),
            unread: parsed.labelIds?.includes("UNREAD") || false,
            priority: categorization?.priority || null,
            category: categorization?.category || null,
            reasoning: categorization?.reasoning || null,
          };
        })
      )
    ).filter((e) => e !== null);

    // Filter based on voice query
    let filteredEmails = emailsWithDetails;

    if (query.query) {
      const lowerQuery = query.query.toLowerCase();

      // Check if any emails have categorization data
      const hasCategorizations = emailsWithDetails.some(e => e.priority !== null || e.category !== null);

      if (lowerQuery.includes("urgent")) {
        const filtered = filteredEmails.filter((e) => e.priority === "urgent");
        // If no urgent emails found but emails haven't been categorized yet, return all emails
        filteredEmails = filtered.length > 0 || hasCategorizations ? filtered : filteredEmails;
      } else if (lowerQuery.includes("important")) {
        const filtered = filteredEmails.filter(
          (e) => e.priority === "urgent" || e.priority === "important"
        );
        // If no important emails found but emails haven't been categorized yet, return all emails
        filteredEmails = filtered.length > 0 || hasCategorizations ? filtered : filteredEmails;
      } else if (lowerQuery.includes("newsletter")) {
        const filtered = filteredEmails.filter(
          (e) => e.category === "newsletters"
        );
        // If no newsletters found but emails haven't been categorized yet, return all emails
        filteredEmails = filtered.length > 0 || hasCategorizations ? filtered : filteredEmails;
      }
    }

    // Sort by priority then date
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      important: 1,
      normal: 2,
      low: 3,
    };

    filteredEmails.sort((a, b) => {
      const priorityA = a.priority ? priorityOrder[a.priority] ?? 999 : 999;
      const priorityB = b.priority ? priorityOrder[b.priority] ?? 999 : 999;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return b.date.getTime() - a.date.getTime();
    });

    // Take top N
    const topPriority = filteredEmails.slice(0, query.maxResults).map((e) => ({
      id: e.threadId,
      subject: e.subject,
      from: e.from,
      snippet: e.snippet.substring(0, 150),
      timestamp: e.date.getTime(),
      unread: e.unread,
      priority: e.priority as "urgent" | "important" | "normal" | "low" | null,
      reasoning: e.reasoning || undefined,
    }));

    // Calculate category counts
    const categories = filteredEmails.reduce(
      (acc, email) => {
        if (!email.category) return acc;
        if (email.category === "urgent") acc.urgent++;
        else if (email.category === "important") acc.important++;
        else if (email.category === "newsletters") acc.newsletters++;
        else if (email.category === "team") acc.team++;
        else acc.other++;
        return acc;
      },
      { urgent: 0, important: 0, newsletters: 0, team: 0, other: 0 }
    );

    const duration = Date.now() - startTime;
    console.log(`Voice summary completed in ${duration}ms`, {
      totalMatches,
      fetched: messagesToFetch.length,
      returned: topPriority.length,
      categories,
    });

    return {
      summary: {
        totalMatches, // Report ACTUAL total from Gmail (estimate)
        query: query.query || "",
        categories,
      },
      topPriority,
      hasMore: totalMatches > topPriority.length,
    };
  } catch (error) {
    console.error("Error in getVoiceSummary:", error);
    throw error;
  }
}
