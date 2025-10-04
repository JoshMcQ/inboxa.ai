import "server-only";

import { z } from "zod";
import { chatCompletionObject } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { createScopedLogger } from "@/utils/logger";
import { emailToContent } from "@/utils/mail";
import type {
  ThreadSummaryPayload,
  ThreadSummaryResult,
} from "@/app/api/ai/summaries/validation";
import {
  getThreadSummaryCache,
  setThreadSummaryCache,
} from "@/utils/redis/thread-summaries";

const logger = createScopedLogger("ai/summaries");

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => item?.toString().trim())
      .filter((item): item is string => Boolean(item?.length));
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|\u2022/)
      .map((item) => item.replace(/^[-*•]\s*/, "").trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

const stringOrArrayField = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((val) => normalizeList(val));

const llmThreadSummarySchema = z.object({
  threadHeadline: z.string().min(1),
  threadBullets: stringOrArrayField,
  latestMessageSummary: z.string().optional(),
  actionItems: stringOrArrayField,
  keyFacts: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .max(10)
    .optional(),
});

type ThreadSummaryLLMResult = z.infer<typeof llmThreadSummarySchema>;

function formatDate(date?: string) {
  if (!date) return "Unknown time";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildMessageContent(message: ThreadSummaryPayload["messages"][number], snippet?: string) {
  return emailToContent(
    {
      textHtml: message.textHtml || undefined,
      textPlain: message.textPlain || undefined,
      snippet: snippet ?? "",
    },
    {
      maxLength: 2000,
      extractReply: true,
      removeForwarded: true,
    },
  );
}

function buildThreadNarrative(thread: ThreadSummaryPayload) {
  return thread.messages
    .map((message, index) => {
      const content = buildMessageContent(message, thread.snippet);
      return [
        `Message #${index + 1}`,
        message.from ? `From: ${message.from}` : null,
        message.to ? `To: ${message.to}` : null,
        `Sent: ${formatDate(message.date)}`,
        "Content:",
        content,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n---\n");
}

function getLatestMessage(thread: ThreadSummaryPayload) {
  return thread.messages[thread.messages.length - 1];
}

export async function summarizeThread({
  thread,
  emailAccount,
  since,
}: {
  thread: ThreadSummaryPayload;
  emailAccount: EmailAccountWithAI;
  since?: string;
}): Promise<ThreadSummaryResult> {
  const latestMessage = getLatestMessage(thread);
  const cacheKey = {
    threadId: thread.threadId,
    latestMessageId: latestMessage?.id || thread.latestMessageId,
  };

  const cached = await getThreadSummaryCache(cacheKey);
  if (cached) {
    return cached;
  }

  const threadNarrative = buildThreadNarrative(thread);
  const latestMessageContent = buildMessageContent(latestMessage, thread.snippet);

  const system = `You are InboxA, a voice-first email copilot.
Produce concise, high-signal summaries for busy professionals.
Return JSON with keys: threadHeadline (≤12 words), threadBullets (≤5 short bullets), latestMessageSummary (≤25 words), actionItems (≤4 imperative bullets), keyFacts (≤5 label/value pairs).
Keep language neutral, note commitments, deadlines, amounts, and flag urgency when present.`;

  const prompt = `Thread subject: ${thread.subject ?? "(no subject)"}
Category: ${thread.category ?? "Uncategorized"}
Since marker: ${since ?? "Not provided"}

Thread conversation (oldest to newest):
${threadNarrative}

Latest message details:
${latestMessageContent}`;

  let llmResult: ThreadSummaryLLMResult | null = null;

  try {
    const completion = await chatCompletionObject({
      userAi: emailAccount.user,
      system,
      prompt,
      schema: llmThreadSummarySchema,
      userEmail: emailAccount.email,
      usageLabel: "Thread summary",
    });

    llmResult = completion.object as ThreadSummaryLLMResult;
  } catch (error) {
    logger.error("LLM summarization failed", {
      error,
      threadId: thread.threadId,
    });
  }

  const fallbackHeadline = thread.subject?.trim().slice(0, 80) || "Email thread";

  const summary: ThreadSummaryResult = {
    threadId: thread.threadId,
    threadHeadline: llmResult?.threadHeadline || fallbackHeadline,
    threadBullets: llmResult?.threadBullets ?? [],
    latestMessageSummary: llmResult?.latestMessageSummary,
    actionItems: llmResult?.actionItems ?? [],
    keyFacts: llmResult?.keyFacts?.filter((fact) => fact.label && fact.value) || [],
    generatedAt: new Date().toISOString(),
  };

  await setThreadSummaryCache(cacheKey, summary);

  return summary;
}
