import { parseMessages } from "@/utils/mail";
import type { gmail_v1 } from "@googleapis/gmail";
import { GmailLabel } from "@/utils/gmail/label";
import { isDefined } from "@/utils/types";
import prisma from "@/utils/prisma";
import { getCategory } from "@/utils/redis/category";
import {
  getThreadsBatch,
  getThreadsWithNextPageToken,
} from "@/utils/gmail/thread";
import { decodeSnippet } from "@/utils/gmail/decode";
import type { ThreadsQuery } from "@/app/api/google/threads/validation";
import { ExecutedRuleStatus } from "@prisma/client";
import { SafeError } from "@/utils/error";

export type ThreadsResponse = Awaited<ReturnType<typeof getThreads>>;

export async function getThreads({
  query,
  gmail,
  accessToken,
  emailAccountId,
}: {
  query: ThreadsQuery;
  gmail: gmail_v1.Gmail;
  accessToken: string;
  emailAccountId: string;
}) {
  if (!accessToken) throw new SafeError("Missing access token");

  function getQuery() {
    let baseQuery = '';

    // Start with type-based filter using query operators (more accurate than labelIds)
    if (query.type === "inbox" || !query.type || query.type === "undefined" || query.type === "null") {
      // Filter to Primary tab only (excludes Promotions, Social, Updates, Forums)
      baseQuery = "in:inbox category:primary";
    } else if (query.type === "sent") {
      baseQuery = "in:sent";
    } else if (query.type === "draft") {
      baseQuery = "in:draft";
    } else if (query.type === "trash") {
      baseQuery = "in:trash";
    } else if (query.type === "spam") {
      baseQuery = "in:spam";
    } else if (query.type === "starred") {
      baseQuery = "is:starred";
    } else if (query.type === "important") {
      baseQuery = "is:important";
    } else if (query.type === "unread") {
      baseQuery = "is:unread";
    } else if (query.type === "archive") {
      baseQuery = `-in:inbox -in:trash -in:spam`;
    } else if (query.type === "all") {
      baseQuery = ""; // Search everything
    }

    // Override with custom query if provided
    if (query.q) {
      return query.q;
    }

    // Add sender filter if provided
    if (query.fromEmail) {
      return baseQuery ? `${baseQuery} from:${query.fromEmail}` : `from:${query.fromEmail}`;
    }

    return baseQuery || "in:inbox";
  }

  const { threads: gmailThreads, nextPageToken } =
    await getThreadsWithNextPageToken({
      gmail,
      q: getQuery(),
      labelIds: query.labelId ? [query.labelId] : undefined, // Only use labelIds for custom labels
      maxResults: query.limit || 50,
      pageToken: query.nextPageToken || undefined,
    });

  const threadIds = gmailThreads?.map((t) => t.id).filter(isDefined) || [];
  
  const finalQuery = getQuery();
  console.log('Gmail API Debug:', {
    query: finalQuery,
    labelIds: query.labelId ? [query.labelId] : undefined,
    gmailThreadsCount: gmailThreads?.length || 0,
    threadIds: threadIds.length,
    type: query.type
  });

  const [threads, plans] = await Promise.all([
    getThreadsBatch(threadIds, accessToken), // may have been faster not using batch method, but doing 50 getMessages in parallel
    prisma.executedRule.findMany({
      where: {
        emailAccountId,
        threadId: { in: threadIds },
        status: {
          // TODO probably want to show applied rules here in the future too
          in: [ExecutedRuleStatus.PENDING, ExecutedRuleStatus.SKIPPED],
        },
      },
      select: {
        id: true,
        messageId: true,
        threadId: true,
        rule: true,
        actionItems: true,
        status: true,
        reason: true,
      },
    }),
  ]);

  const threadsWithMessages = await Promise.all(
    threads.map(async (thread) => {
      const id = thread.id;
      if (!id) return;
      const messages = parseMessages(thread, { withoutIgnoredSenders: true });

      const plan = plans.find((p) => p.threadId === id);

      return {
        id,
        messages,
        snippet: decodeSnippet(thread.snippet),
        plan,
        category: await getCategory({ emailAccountId, threadId: id }),
      };
    }) || [],
  );

  const result = {
    threads: threadsWithMessages.filter(isDefined),
    nextPageToken,
  };
  
  console.log('Gmail API Result:', {
    threadsCount: result.threads.length,
    hasNextPageToken: !!result.nextPageToken,
    firstThreadId: result.threads[0]?.id,
    firstThreadSnippet: result.threads[0]?.snippet?.slice(0, 100)
  });
  
  return result;
}

function getLabelIds(type?: string | null) {
  switch (type) {
    case "inbox":
      return [GmailLabel.INBOX];
    case "sent":
      return [GmailLabel.SENT];
    case "draft":
      return [GmailLabel.DRAFT];
    case "trash":
      return [GmailLabel.TRASH];
    case "spam":
      return [GmailLabel.SPAM];
    case "starred":
      return [GmailLabel.STARRED];
    case "important":
      return [GmailLabel.IMPORTANT];
    case "unread":
      return [GmailLabel.UNREAD];
    case "archive":
      return undefined;
    case "all":
      return undefined;
    default:
      if (!type || type === "undefined" || type === "null")
        return [GmailLabel.INBOX];
      return [type];
  }
}
