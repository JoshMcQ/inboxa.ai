import { NextResponse } from "next/server";
import { z } from "zod";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { getMessage } from "@/utils/gmail/message";
import { parseMessage } from "@/utils/mail";
import { emailToContent } from "@/utils/mail";
import { createScopedLogger } from "@/utils/logger";
import type { gmail_v1 } from "@googleapis/gmail";

const logger = createScopedLogger("api/voice/read");

const readQuery = z.object({
  threadId: z.string().optional(),
  messageId: z.string().optional(),
  fromEmail: z.string().optional(),
});

// Helper to find most recent message from sender
async function findMessageFromSender(
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
    } else {
      queries.push(`from:"${normalizedEmail}" -label:sent -label:draft in:inbox`);
      queries.push(`from:${normalizedEmail} -label:sent -label:draft in:inbox`);
    }
  }

  for (const query of queries) {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 1,
      orderBy: "relevance",
    });
    if (response.data.messages && response.data.messages.length > 0) {
      return response.data.messages[0].id || null;
    }
  }
  return null;
}

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const messageId = searchParams.get("messageId");
  const fromEmail = searchParams.get("fromEmail");

  const query = readQuery.parse({
    threadId,
    messageId,
    fromEmail,
  });

  try {
    const gmail = await getGmailClientForEmail({ emailAccountId });
    let actualMessageId = query.messageId;

    // If fromEmail provided, find message
    if (!actualMessageId && query.fromEmail) {
      actualMessageId = await findMessageFromSender(gmail, query.fromEmail);
      if (!actualMessageId) {
        return NextResponse.json(
          { error: "Could not find email from that sender" },
          { status: 404 }
        );
      }
    }

    // If threadId provided, get first message from thread
    if (!actualMessageId && query.threadId) {
      const thread = await gmail.users.threads.get({
        userId: "me",
        id: query.threadId,
        format: "full",
      });

      const messages = thread.data.messages;
      if (!messages || messages.length === 0) {
        return NextResponse.json(
          { error: "Thread not found" },
          { status: 404 }
        );
      }

      // Get the most recent message (last in array)
      actualMessageId = messages[messages.length - 1].id || null;
    }

    if (!actualMessageId) {
      return NextResponse.json(
        { error: "messageId, threadId, or fromEmail is required" },
        { status: 400 }
      );
    }

    // Get message
    const message = await getMessage(actualMessageId, gmail, "full");
    const parsedMessage = parseMessage(message);

    // Extract text content
    const textContent = emailToContent(parsedMessage, {
      maxLength: undefined, // No limit for reading
      extractReply: false,
      removeForwarded: false,
    });

    // Clean up for voice reading
    let cleanedText = textContent
      .replace(/\n{3,}/g, "\n\n") // Max 2 newlines
      .replace(/https?:\/\/[^\s]+/g, "[link]") // Replace URLs
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
      .trim();

    // Add headers info
    const from = parsedMessage.headers.from || "Unknown";
    const subject = parsedMessage.headers.subject || "(No subject)";
    const date = parsedMessage.headers.date || "";

    const fullContent = `From: ${from}\nSubject: ${subject}\nDate: ${date}\n\n${cleanedText}`;

    return NextResponse.json({
      success: true,
      message: fullContent,
      from,
      subject,
      date,
    });
  } catch (error) {
    logger.error("Error reading email", { error, emailAccountId });
    return NextResponse.json(
      { error: "Failed to read email", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});



