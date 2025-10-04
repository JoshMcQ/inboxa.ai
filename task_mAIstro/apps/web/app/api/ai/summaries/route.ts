import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import {
  summariesRequestSchema,
  type ThreadSummaryResult,
} from "@/app/api/ai/summaries/validation";
import { summarizeThread } from "@/utils/ai/summaries/summarize-thread";
import { getEmailAccountWithAi } from "@/utils/user/get";
import prisma from "@/utils/prisma";

export const maxDuration = 120;

export const POST = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const body = await request.json();
  const parsed = summariesRequestSchema.parse(body);

  const emailAccount = await getEmailAccountWithAi({ emailAccountId });

  if (!emailAccount) {
    return NextResponse.json({ error: "Email account not found" }, {
      status: 404,
    });
  }

  const { threads: rawThreads, filters, since } = parsed;

  const filteredThreads = rawThreads.filter((thread) => {
    if (filters?.includeCategories?.length) {
      if (!thread.category || !filters.includeCategories.includes(thread.category)) {
        return false;
      }
    }

    if (filters?.excludeCategories?.length) {
      if (thread.category && filters.excludeCategories.includes(thread.category)) {
        return false;
      }
    }

    if (filters?.unreadOnly && !thread.isUnread) {
      return false;
    }

    if (filters?.importantOnly && !thread.isImportant) {
      return false;
    }

    return true;
  });

  const limitedThreads = filteredThreads.slice(0, 10);
  const summaries: ThreadSummaryResult[] = [];

  // Process with optimized concurrency
  const CHUNK_SIZE = 3; // Reduced to avoid rate limits
  for (let index = 0; index < limitedThreads.length; index += CHUNK_SIZE) {
    const chunk = limitedThreads.slice(index, index + CHUNK_SIZE);

    const chunkSummaries = await Promise.allSettled(
      chunk.map(async (thread) => {
        try {
          return await summarizeThread({
            thread,
            emailAccount,
            since,
          });
        } catch (error) {
          console.error(`Failed to summarize thread ${thread.threadId}:`, error);
          // Return a fallback summary instead of failing entirely
          return {
            threadId: thread.threadId,
            threadHeadline: thread.subject || "Email thread",
            threadBullets: [],
            latestMessageSummary: "Summary temporarily unavailable",
            actionItems: [],
            keyFacts: [],
            generatedAt: new Date().toISOString(),
          } as ThreadSummaryResult;
        }
      }),
    );

    // Extract successful results
    chunkSummaries.forEach((result) => {
      if (result.status === "fulfilled") {
        summaries.push(result.value);
      }
    });

    // Add delay between chunks to avoid rate limits
    if (index + CHUNK_SIZE < limitedThreads.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  await prisma.emailAccount.update({
    where: { id: emailAccountId },
    data: {
      lastSummaryCheckAt: new Date(),
      summaryPreferences: filters ? JSON.parse(JSON.stringify(filters)) : undefined,
    },
  });

  return NextResponse.json({
    summaries,
    appliedFilters: filters,
    since,
  });
});
