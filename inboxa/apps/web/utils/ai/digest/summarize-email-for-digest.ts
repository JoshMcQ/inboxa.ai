import type { z } from "zod";
import { createScopedLogger } from "@/utils/logger";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { DigestEmailSummarySchema as schema } from "@/app/api/resend/digest/validation";

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
  // AI Summaries feature has been removed - return basic summary
  if (!messageToSummarize) return null;

  try {
    // Return a simple summary from the content
    const summaryText = messageToSummarize.content.slice(0, 200);
    return { summary: summaryText } as AISummarizeResult;
  } catch (error) {
    logger.error("Failed to summarize email", { error });
    return { summary: undefined };
  }
}
