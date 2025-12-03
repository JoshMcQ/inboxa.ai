import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { env } from "@/env";
import prisma from "@/utils/prisma";
import { categorizeEmails, type EmailToCategorize } from "@/utils/ai/categorize";
import { getGmailClientForEmail } from "@/utils/account";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("cron/categorize-emails");

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for batch processing

/**
 * Cron endpoint to categorize uncategorized emails in batches
 *
 * Process:
 * 1. Find emails without categorization (priority/category = null)
 * 2. Fetch full email details from Gmail API
 * 3. Run two-stage categorization:
 *    - Rule-based (free, instant) for 60-70% of emails
 *    - AI batch (gpt-4o-mini) for remaining 30-40%
 * 4. Save categorizations to database
 *
 * Expected to run every 5-15 minutes via cron
 */
export const GET = withError(async (request: Request) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // Verify cron secret
  if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
    logger.warn("Invalid or missing cron token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  logger.info("Starting email categorization cron job");

  try {
    // Get all email accounts
    const emailAccounts = await prisma.emailAccount.findMany({
      select: {
        id: true,
        email: true,
      },
      take: 10, // Process max 10 accounts per run to avoid timeouts
    });

    if (emailAccounts.length === 0) {
      logger.info("No email accounts found");
      return NextResponse.json({
        success: true,
        message: "No email accounts to process",
      });
    }

    logger.info(`Processing ${emailAccounts.length} email accounts`);

    let totalProcessed = 0;
    let totalCategorized = 0;
    let totalErrors = 0;

    // Process each account
    for (const account of emailAccounts) {
      try {
        const result = await categorizeEmailsForAccount(account.id);
        totalProcessed += result.processed;
        totalCategorized += result.categorized;
      } catch (error) {
        logger.error("Failed to categorize emails for account", {
          accountId: account.id,
          email: account.email,
          error,
        });
        totalErrors++;
      }
    }

    const duration = Date.now() - startTime;

    logger.info("Email categorization cron job completed", {
      duration,
      accounts: emailAccounts.length,
      totalProcessed,
      totalCategorized,
      totalErrors,
    });

    return NextResponse.json({
      success: true,
      duration,
      accounts: emailAccounts.length,
      totalProcessed,
      totalCategorized,
      totalErrors,
    });
  } catch (error) {
    logger.error("Categorization cron job failed", { error });
    return NextResponse.json(
      {
        error: "Categorization failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

/**
 * Categorize uncategorized emails for a single email account
 */
async function categorizeEmailsForAccount(emailAccountId: string): Promise<{
  processed: number;
  categorized: number;
}> {
  logger.info("Processing account", { emailAccountId });

  // Find uncategorized emails (priority and category both null)
  const uncategorized = await prisma.emailCategorization.findMany({
    where: {
      emailAccountId,
      priority: null,
      category: null,
    },
    select: {
      id: true,
      messageId: true,
      threadId: true,
      date: true,
    },
    orderBy: {
      date: "desc", // Prioritize recent emails
    },
    take: 200, // Process 200 emails max per account per run
  });

  if (uncategorized.length === 0) {
    logger.info("No uncategorized emails for account", { emailAccountId });
    return { processed: 0, categorized: 0 };
  }

  logger.info(`Found ${uncategorized.length} uncategorized emails`, {
    emailAccountId,
  });

  // Get Gmail client
  const gmail = await getGmailClientForEmail({ emailAccountId });

  // Fetch full email details from Gmail
  const emailsToProcess: EmailToCategorize[] = [];

  for (const email of uncategorized) {
    try {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: email.messageId,
        format: "full",
      });

      const headers = message.data.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const snippet = message.data.snippet || "";

      emailsToProcess.push({
        id: email.id, // Use categorization record ID, not messageId
        from,
        subject,
        snippet,
        date: email.date,
      });
    } catch (error) {
      logger.error("Failed to fetch email from Gmail", {
        messageId: email.messageId,
        error,
      });
    }
  }

  if (emailsToProcess.length === 0) {
    logger.warn("No emails could be fetched from Gmail", { emailAccountId });
    return { processed: uncategorized.length, categorized: 0 };
  }

  logger.info(`Categorizing ${emailsToProcess.length} emails`, {
    emailAccountId,
  });

  // Run categorization (rule-based + AI batch)
  const categorized = await categorizeEmails(emailsToProcess, true);

  logger.info(`Categorization complete: ${categorized.length} emails`, {
    emailAccountId,
    ruleBasedCount: categorized.filter(
      (e) => e.categorizationMethod === "rule-based"
    ).length,
    aiCount: categorized.filter((e) => e.categorizationMethod === "ai").length,
  });

  // Save categorizations to database
  let savedCount = 0;
  for (const email of categorized) {
    try {
      await prisma.emailCategorization.update({
        where: { id: email.id },
        data: {
          priority: email.priority,
          category: email.category,
          reasoning: email.reasoning,
        },
      });
      savedCount++;
    } catch (error) {
      logger.error("Failed to save categorization", {
        emailId: email.id,
        error,
      });
    }
  }

  logger.info(`Saved ${savedCount} categorizations to database`, {
    emailAccountId,
  });

  return {
    processed: uncategorized.length,
    categorized: savedCount,
  };
}
