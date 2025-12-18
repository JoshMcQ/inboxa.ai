import { NextResponse } from "next/server";
import { z } from "zod";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("api/voice/send");

const sendQuery = z.object({
  draftId: z.string(),
});

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draftId");

  const query = sendQuery.parse({ draftId });

  try {
    const gmail = await getGmailClientForEmail({ emailAccountId });

    // Get the draft
    const draftResponse = await gmail.users.drafts.get({
      userId: "me",
      id: query.draftId,
      format: "full",
    });

    if (!draftResponse.data.message) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Send the draft
    const sendResponse = await gmail.users.drafts.send({
      userId: "me",
      requestBody: {
        id: query.draftId,
      },
    });

    const messageId = sendResponse.data.id;
    const threadId = sendResponse.data.threadId;

    return NextResponse.json({
      success: true,
      messageId,
      threadId,
      message: "Email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending draft", { error, emailAccountId, draftId: query.draftId });
    return NextResponse.json(
      { error: "Failed to send email", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});



