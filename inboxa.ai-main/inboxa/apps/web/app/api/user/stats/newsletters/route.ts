import { NextResponse } from "next/server";
import { z } from "zod";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailAndAccessTokenForEmail } from "@/utils/account";
import { getMessages, getMessagesBatch } from "@/utils/gmail/message";
import { extractEmailAddress } from "@/utils/email";
import { createScopedLogger } from "@/utils/logger";
import prisma from "@/utils/prisma";
import { NewsletterStatus } from "@prisma/client";
import { GmailLabel } from "@/utils/gmail/label";
// Unsubscribe links will come from headers
import { isDefined } from "@/utils/types";

const logger = createScopedLogger("api/user/stats/newsletters");

const newsletterStatsQuery = z.object({
  types: z.array(z.string()).optional().default([]),
  filters: z.array(z.string()).optional().default([]),
  orderBy: z.enum(["emails", "unread", "unarchived"]).optional().default("emails"),
  limit: z.coerce.number().optional().default(100),
  includeMissingUnsubscribe: z.coerce.boolean().optional().default(false),
  fromDate: z.coerce.number().optional(),
  toDate: z.coerce.number().optional(),
});

export type NewsletterStatsQuery = z.infer<typeof newsletterStatsQuery>;

export type NewsletterStatsItem = {
  name: string;
  value: number;
  readEmails: number;
  inboxEmails: number;
  archivedEmails?: number; // Deprecated, kept for backwards compatibility
  unsubscribeLink?: string | null;
  status?: NewsletterStatus | null;
  autoArchived?: { id?: string | null } | null;
};

export type NewsletterStatsResponse = {
  newsletters: NewsletterStatsItem[];
};

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  const { searchParams } = new URL(request.url);
  const query = newsletterStatsQuery.parse({
    types: searchParams.getAll("types"),
    filters: searchParams.getAll("filters"),
    orderBy: searchParams.get("orderBy"),
    limit: searchParams.get("limit"),
    includeMissingUnsubscribe: searchParams.get("includeMissingUnsubscribe"),
    fromDate: searchParams.get("fromDate"),
    toDate: searchParams.get("toDate"),
  });

  try {
    const { gmail, accessToken } = await getGmailAndAccessTokenForEmail({
      emailAccountId,
    });

    if (!accessToken) {
      return NextResponse.json(
        { error: "Gmail access token not found. Please re-authenticate.", isKnownError: true },
        { status: 401 }
      );
    }

    // Build Gmail query - get all messages (not just inbox) to calculate accurate stats
    let gmailQuery = "-label:sent -label:draft";
    if (query.fromDate) {
      const fromDate = new Date(query.fromDate);
      gmailQuery += ` after:${Math.floor(fromDate.getTime() / 1000)}`;
    }
    if (query.toDate) {
      const toDate = new Date(query.toDate);
      gmailQuery += ` before:${Math.floor(toDate.getTime() / 1000)}`;
    }

    // Get messages from inbox
    const { messages } = await getMessages(gmail, {
      query: gmailQuery,
      maxResults: 100, // Limit to 100 to match getMessagesBatch limit
      pageToken: undefined,
    });

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        newsletters: [],
      });
    }

    // Get full message details - batch in chunks of 100
    const messageIds = messages.map((m) => m.id).filter(isDefined);
    
    // getMessagesBatch has a limit of 100, so we need to batch if we have more
    const fullMessages: any[] = [];
    for (let i = 0; i < messageIds.length; i += 100) {
      const chunk = messageIds.slice(i, i + 100);
      const chunkMessages = await getMessagesBatch({
        messageIds: chunk,
        accessToken,
      });
      fullMessages.push(...chunkMessages);
    }

    // Aggregate by sender
    const senderMap = new Map<string, {
      name: string;
      value: number;
      readEmails: number;
      inboxEmails: number;
      unsubscribeLinks: Set<string>;
    }>();

    for (const message of fullMessages) {
      const from = message.headers.from;
      if (!from) continue;

      const email = extractEmailAddress(from);
      if (!email) continue;

      const existing = senderMap.get(email) || {
        name: email,
        value: 0,
        readEmails: 0,
        inboxEmails: 0,
        unsubscribeLinks: new Set<string>(),
      };

      existing.value++;
      if (!message.labelIds?.includes(GmailLabel.UNREAD)) {
        existing.readEmails++;
      }
      if (message.labelIds?.includes(GmailLabel.INBOX)) {
        existing.inboxEmails++;
      }

      // Get unsubscribe link from headers (list-unsubscribe header)
      const unsubscribeLink = message.headers["list-unsubscribe"];
      if (unsubscribeLink) {
        existing.unsubscribeLinks.add(unsubscribeLink);
      }

      senderMap.set(email, existing);
    }

    // Get newsletter statuses from database
    const newsletters = await prisma.newsletter.findMany({
      where: {
        emailAccountId,
        email: { in: Array.from(senderMap.keys()) },
      },
    });

    const newsletterStatusMap = new Map(
      newsletters.map((n) => [n.email, n.status])
    );

    // Convert to response format
    const newsletterStats: NewsletterStatsItem[] = Array.from(senderMap.values())
      .map((sender) => {
        const unsubscribeLink = Array.from(sender.unsubscribeLinks)[0] || null;
        const status = newsletterStatusMap.get(sender.name) || null;

        return {
          name: sender.name,
          value: sender.value,
          readEmails: sender.readEmails,
          inboxEmails: sender.inboxEmails,
          archivedEmails: sender.value - sender.inboxEmails, // For backwards compatibility
          unsubscribeLink,
          status,
          autoArchived: status === NewsletterStatus.AUTO_ARCHIVED ? { id: null } : null,
        };
      })
      .sort((a, b) => {
        switch (query.orderBy) {
          case "unread":
            return (b.value - b.readEmails) - (a.value - a.readEmails);
          case "unarchived":
            return (b.value - b.inboxEmails) - (a.value - a.inboxEmails);
          case "emails":
          default:
            return b.value - a.value;
        }
      })
      .slice(0, query.limit);

    return NextResponse.json({
      newsletters: newsletterStats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("Error fetching newsletter stats", { 
      error: errorMessage,
      stack: errorStack,
      emailAccountId 
    });
    return NextResponse.json(
      { error: "Failed to fetch newsletter statistics", details: errorMessage },
      { status: 500 }
    );
  }
});

