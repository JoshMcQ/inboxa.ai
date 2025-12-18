import { NextResponse } from "next/server";
import { z } from "zod";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { getDraft } from "@/utils/gmail/draft";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("api/google/drafts");

const draftsQuery = z.object({
  limit: z.coerce.number().optional().default(10),
  pageToken: z.string().optional().nullable(),
});

export type DraftsResponse = {
  drafts: Array<{
    id: string;
    message: {
      id: string;
      threadId: string;
      headers: {
        from?: string;
        to?: string;
        subject?: string;
      };
      snippet?: string;
      payload?: {
        body?: {
          data?: string;
        };
        parts?: Array<{
          body?: {
            data?: string;
          };
          mimeType?: string;
        }>;
      };
    };
  }>;
  nextPageToken?: string | null;
};

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const pageToken = searchParams.get("pageToken");

  const query = draftsQuery.parse({
    limit,
    pageToken: pageToken === "null" ? null : pageToken,
  });

  try {
    const gmail = await getGmailClientForEmail({ emailAccountId });

    // List drafts from Gmail
    const response = await gmail.users.drafts.list({
      userId: "me",
      maxResults: query.limit,
      pageToken: query.pageToken || undefined,
    });

    const draftIds = response.data.drafts?.map((d) => d.id).filter(Boolean) || [];

    // Fetch full draft details
    const drafts = await Promise.all(
      draftIds.map(async (draftId) => {
        try {
          const draftResponse = await gmail.users.drafts.get({
            userId: "me",
            id: draftId,
            format: "full",
          });

          const message = draftResponse.data.message;
          if (!message) return null;

          return {
            id: draftId,
            message: {
              id: message.id || "",
              threadId: message.threadId || "",
              headers: {
                from: message.payload?.headers?.find((h) => h.name === "From")?.value,
                to: message.payload?.headers?.find((h) => h.name === "To")?.value,
                subject: message.payload?.headers?.find((h) => h.name === "Subject")?.value,
              },
              snippet: message.snippet,
              payload: message.payload
                ? {
                    body: message.payload.body,
                    parts: message.payload.parts,
                  }
                : undefined,
            },
          };
        } catch (error) {
          logger.error("Error fetching draft", { draftId, error });
          return null;
        }
      }),
    );

    const validDrafts = drafts.filter((d): d is NonNullable<typeof d> => d !== null);

    return NextResponse.json({
      drafts: validDrafts,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    logger.error("Error listing drafts", { emailAccountId, error });
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 },
    );
  }
});



