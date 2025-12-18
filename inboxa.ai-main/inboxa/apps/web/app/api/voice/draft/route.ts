import { NextResponse } from "next/server";
import { z } from "zod";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { getThreadMessages } from "@/utils/gmail/thread";
import { getMessage } from "@/utils/gmail/message";
import { parseMessage } from "@/utils/mail";
import { draftEmail } from "@/utils/gmail/mail";
import { createReplyContent } from "@/utils/gmail/reply";
import { getEmailAccountWithAi } from "@/utils/user/get";
import { aiDraftWithKnowledge } from "@/utils/ai/reply/draft-with-knowledge";
import { getEmailForLLM } from "@/utils/get-email-from-message";
import { internalDateToDate } from "@/utils/date";
import { createScopedLogger } from "@/utils/logger";
import type { gmail_v1 } from "@googleapis/gmail";

const logger = createScopedLogger("api/voice/draft");

const draftQuery = z.object({
  threadId: z.string().optional(),
  content: z.string().optional(),
  tone: z.enum(["formal", "casual", "brief"]).optional(),
});

// Helper to find thread from sender email
async function findThreadFromSender(
  gmail: gmail_v1.Gmail,
  senderEmail: string
): Promise<string | null> {
  let normalizedEmail = senderEmail
    .replace(/\s+/g, " ")
    .replace(/at/gi, "@")
    .replace(/dot/gi, ".")
    .replace(/\[at\]/gi, "@")
    .replace(/\[dot\]/gi, ".")
    .trim();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  let queries: string[] = [];

  if (isEmail) {
    queries.push(`from:${normalizedEmail} -label:sent -label:draft in:inbox`);
    queries.push(`from:${normalizedEmail} -label:sent -label:draft`);
  } else {
    const nameParts = normalizedEmail.split(/\s+/).filter(p => p.length > 0);
    if (nameParts.length >= 2) {
      queries.push(`from:"${normalizedEmail}" -label:sent -label:draft in:inbox`);
      queries.push(`from:${nameParts[0]} -label:sent -label:draft in:inbox`);
      queries.push(`from:${nameParts[nameParts.length - 1]} -label:sent -label:draft in:inbox`);
      queries.push(`from:"${normalizedEmail}" -label:sent -label:draft`);
    } else {
      queries.push(`from:"${normalizedEmail}" -label:sent -label:draft in:inbox`);
      queries.push(`from:${normalizedEmail} -label:sent -label:draft in:inbox`);
    }
  }

  for (const query of queries) {
    const response = await gmail.users.threads.list({
      userId: "me",
      q: query,
      maxResults: 1,
      orderBy: "relevance",
    });
    if (response.data.threads && response.data.threads.length > 0) {
      return response.data.threads[0].id || null;
    }
  }
  return null;
}

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split("@")[0];
}

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const { searchParams } = new URL(request.url);
  const threadIdParam = searchParams.get("threadId");
  const content = searchParams.get("content");
  const tone = searchParams.get("tone");

  const query = draftQuery.parse({
    threadId: threadIdParam,
    content,
    tone,
  });

  try {
    const gmail = await getGmailClientForEmail({ emailAccountId });
    let actualThreadId = query.threadId;

    // If threadId looks like an email, search for thread
    if (actualThreadId && actualThreadId.includes("@")) {
      actualThreadId = await findThreadFromSender(gmail, actualThreadId);
      if (!actualThreadId) {
        return NextResponse.json(
          { error: "Could not find thread from that sender" },
          { status: 404 }
        );
      }
    }

    if (!actualThreadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }

    // Get thread messages
    const threadMessages = await getThreadMessages(actualThreadId, gmail);
    if (!threadMessages || threadMessages.length === 0) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    const lastMessage = threadMessages[threadMessages.length - 1];

    // Generate draft content
    let draftContent: string;
    if (content) {
      // Use provided content
      draftContent = content;
    } else {
      // Generate with AI
      const emailAccount = await getEmailAccountWithAi({ emailAccountId });
      if (!emailAccount) {
        return NextResponse.json(
          { error: "Email account not found" },
          { status: 404 }
        );
      }

      const messages = threadMessages.map((msg, index) => ({
        date: internalDateToDate(msg.internalDate),
        to: msg.headers.from,
        ...getEmailForLLM(msg, {
          maxLength: index === threadMessages.length - 1 ? 2000 : 500,
          extractReply: true,
          removeForwarded: false,
        }),
      }));

      draftContent = await aiDraftWithKnowledge({
        messages: messages as any,
        emailAccount,
        knowledgeBaseContent: null,
        emailHistorySummary: null,
        writingStyle: null,
      });
    }

    // Create draft
    const draftResult = await draftEmail(gmail, lastMessage, {
      content: draftContent,
    });

    const draftId = draftResult.data.id;
    if (!draftId) {
      return NextResponse.json(
        { error: "Failed to create draft" },
        { status: 500 }
      );
    }

    // Get draft preview
    const draftResponse = await gmail.users.drafts.get({
      userId: "me",
      id: draftId,
      format: "full",
    });

    const draftMessage = parseMessage(draftResponse.data.message as any);
    const draftText = draftMessage.textPlain || draftMessage.textHtml?.replace(/<[^>]*>/g, "") || "";

    const response = {
      success: true,
      draftId,
      threadId: actualThreadId,
      preview: draftText.substring(0, 500),
      to: lastMessage.headers.from,
      subject: lastMessage.headers.subject || "(No subject)",
      message: `Draft created for reply to ${extractSenderName(lastMessage.headers.from)}. Say "send it" to send, or "cancel" to discard.`,
      clientEvent: {
        type: "draft-created",
        draftId,
        threadId: actualThreadId,
        to: lastMessage.headers.from,
        subject: lastMessage.headers.subject || "(No subject)",
        preview: draftText.substring(0, 500),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error creating draft", { error, emailAccountId });
    return NextResponse.json(
      { error: "Failed to create draft", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});

