import type { z } from "zod";
import { createScopedLogger } from "@/utils/logger";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { DigestEmailSummarySchema as schema } from "@/app/api/resend/digest/validation";
import { summarizeThread } from "@/utils/ai/summaries/summarize-thread";
import type { ThreadSummaryPayload } from "@/app/api/ai/summaries/validation";

const logger = createScopedLogger("summarize-digest-email");

export type AISummarizeResult = z.infer<typeof schema>;

type DigestSummaryMessage = {
  id: string;
  threadId?: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date?: Date;
};

export async function aiSummarizeEmailForDigest({
  ruleName,
  emailAccount,
  messageToSummarize,
}: {
  ruleName: string;
  emailAccount: EmailAccountWithAI;
  messageToSummarize: DigestSummaryMessage;
}): Promise<AISummarizeResult> {
  // If messageToSummarize somehow is null/undefined, default to null.
  if (!messageToSummarize) return null;

  const threadPayload: ThreadSummaryPayload = {
    threadId: messageToSummarize.threadId || messageToSummarize.id,
    subject: messageToSummarize.subject,
    snippet: messageToSummarize.content.slice(0, 160),
    category: ruleName?.toLowerCase(),
    isUnread: false,
    isImportant: false,
    latestMessageId: messageToSummarize.id,
    messages: [
      {
        id: messageToSummarize.id,
        from: messageToSummarize.from,
        to: messageToSummarize.to,
        date: messageToSummarize.date?.toISOString?.() || undefined,
        textPlain: messageToSummarize.content,
        textHtml: undefined,
      },
    ],
  };

  try {
    const summary = await summarizeThread({
      thread: threadPayload,
      emailAccount,
      since: messageToSummarize.date?.toISOString?.(),
    });

    if (summary.keyFacts.length > 0) {
      return {
        entries: summary.keyFacts.map((fact) => ({
          label: fact.label,
          value: fact.value,
        })),
      } as AISummarizeResult;
    }

    const summaryText = summary.threadBullets.length
      ? summary.threadBullets.join(" · ")
      : summary.latestMessageSummary || summary.threadHeadline;

    return { summary: summaryText } as AISummarizeResult;
  } catch (error) {
    logger.error("Failed to summarize email", { error });
    return { summary: undefined };
  }
}
