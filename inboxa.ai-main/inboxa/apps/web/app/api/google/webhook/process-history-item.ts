import type { gmail_v1 } from "@googleapis/gmail";
import prisma from "@/utils/prisma";
import { emailToContent, parseMessage } from "@/utils/mail";
import { GmailLabel } from "@/utils/gmail/label";
import { getMessage } from "@/utils/gmail/message";
import { runColdEmailBlocker } from "@/utils/cold-email/is-cold-email";
import { runRules } from "@/utils/ai/choose-rule/run-rules";
import { blockUnsubscribedEmails } from "@/app/api/google/webhook/block-unsubscribed-emails";
import { categorizeSender } from "@/utils/categorize/senders/categorize";
import { markMessageAsProcessing } from "@/utils/redis/message-processing";
import { isAssistantEmail } from "@/utils/assistant/is-assistant-email";
import { processAssistantEmail } from "@/utils/assistant/process-assistant-email";
import { handleOutboundReply } from "@/utils/reply-tracker/outbound";
import type { ProcessHistoryOptions } from "@/app/api/google/webhook/types";
import { ColdEmailSetting } from "@prisma/client";
import { logger } from "@/app/api/google/webhook/logger";
import { internalDateToDate } from "@/utils/date";
import { extractEmailAddress } from "@/utils/email";
import { isIgnoredSender } from "@/utils/filter-ignored-senders";
import {
  trackSentDraftStatus,
  cleanupThreadAIDrafts,
} from "@/utils/reply-tracker/draft-tracking";
import type { ParsedMessage } from "@/utils/types";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { formatError } from "@/utils/error";
import { enqueueDigestItem } from "@/utils/digest/index";
import { categorizeWithRules } from "@/utils/ai/categorize/rule-based";
import { extractDomainFromEmail } from "@/utils/email";

export async function processHistoryItem(
  {
    message,
  }: gmail_v1.Schema$HistoryMessageAdded | gmail_v1.Schema$HistoryLabelAdded,
  {
    gmail,
    emailAccount,
    accessToken,
    hasAutomationRules,
    hasAiAccess,
    rules,
  }: ProcessHistoryOptions,
) {
  const messageId = message?.id;
  const threadId = message?.threadId;
  const emailAccountId = emailAccount.id;
  const userEmail = emailAccount.email;

  if (!messageId || !threadId) return;

  const loggerOptions = {
    email: userEmail,
    messageId,
    threadId,
  };

  const isFree = await markMessageAsProcessing({ userEmail, messageId });

  if (!isFree) {
    logger.info("Skipping. Message already being processed.", loggerOptions);
    return;
  }

  logger.info("Getting message", loggerOptions);

  try {
    const [gmailMessage, hasExistingRule] = await Promise.all([
      getMessage(messageId, gmail, "full"),
      prisma.executedRule.findUnique({
        where: {
          unique_emailAccount_thread_message: {
            emailAccountId,
            threadId,
            messageId,
          },
        },
        select: { id: true },
      }),
    ]);

    // if the rule has already been executed, skip
    if (hasExistingRule) {
      logger.info("Skipping. Rule already exists.", loggerOptions);
      return;
    }

    const parsedMessage = parseMessage(gmailMessage);

    if (isIgnoredSender(parsedMessage.headers.from)) {
      logger.info("Skipping. Ignored sender.", loggerOptions);
      return;
    }

    const isForAssistant = isAssistantEmail({
      userEmail,
      emailToCheck: parsedMessage.headers.to,
    });

    if (isForAssistant) {
      logger.info("Passing through assistant email.", loggerOptions);
      return processAssistantEmail({
        message: parsedMessage,
        emailAccountId,
        userEmail,
        gmail,
      });
    }

    const isFromAssistant = isAssistantEmail({
      userEmail,
      emailToCheck: parsedMessage.headers.from,
    });

    if (isFromAssistant) {
      logger.info("Skipping. Assistant email.", loggerOptions);
      return;
    }

    const isOutbound = parsedMessage.labelIds?.includes(GmailLabel.SENT);

    if (isOutbound) {
      await handleOutbound(emailAccount, parsedMessage, gmail);
      return;
    }

    // Cache categorization metadata (not full email)
    await cacheEmailCategorization({
      messageId,
      threadId,
      parsedMessage,
      emailAccountId,
    });

    // check if unsubscribed
    const blocked = await blockUnsubscribedEmails({
      from: parsedMessage.headers.from,
      emailAccountId,
      gmail,
      messageId,
    });

    if (blocked) {
      logger.info("Skipping. Blocked unsubscribed email.", loggerOptions);
      return;
    }

    const shouldRunBlocker = shouldRunColdEmailBlocker(
      emailAccount.coldEmailBlocker,
      hasAiAccess,
    );

    if (shouldRunBlocker) {
      logger.info("Running cold email blocker...", loggerOptions);

      const content = emailToContent(parsedMessage);

      const response = await runColdEmailBlocker({
        email: {
          from: parsedMessage.headers.from,
          to: "",
          subject: parsedMessage.headers.subject,
          content,
          id: messageId,
          threadId,
          date: internalDateToDate(parsedMessage.internalDate),
        },
        gmail,
        emailAccount,
      });

      if (response.isColdEmail) {
        if (emailAccount.coldEmailDigest && response.coldEmailId) {
          logger.info("Enqueuing a cold email digest item", {
            coldEmailId: response.coldEmailId,
          });
          await enqueueDigestItem({
            email: parsedMessage,
            emailAccountId,
            coldEmailId: response.coldEmailId,
          });
        }
        logger.info("Skipping. Cold email detected.", loggerOptions);
        return;
      }
    }

    // categorize a sender if we haven't already
    // this is used for category filters in ai rules
    if (emailAccount.autoCategorizeSenders) {
      const sender = extractEmailAddress(parsedMessage.headers.from);
      const existingSender = await prisma.newsletter.findUnique({
        where: {
          email_emailAccountId: { email: sender, emailAccountId },
        },
        select: { category: true },
      });
      if (!existingSender?.category) {
        await categorizeSender(sender, emailAccount, gmail, accessToken);
      }
    }

    if (hasAutomationRules && hasAiAccess) {
      logger.info("Running rules...", loggerOptions);

      await runRules({
        gmail,
        message: parsedMessage,
        rules,
        emailAccount,
        isTest: false,
      });
    }
  } catch (error: unknown) {
    // gmail bug or snoozed email: https://stackoverflow.com/questions/65290987/gmail-api-getmessage-method-returns-404-for-message-gotten-from-listhistory-meth
    if (
      error instanceof Error &&
      error.message === "Requested entity was not found."
    ) {
      logger.info("Message not found", loggerOptions);
      return;
    }

    throw error;
  }
}

async function handleOutbound(
  emailAccount: EmailAccountWithAI,
  message: ParsedMessage,
  gmail: gmail_v1.Gmail,
) {
  const loggerOptions = {
    email: emailAccount.email,
    messageId: message.id,
    threadId: message.threadId,
  };

  logger.info("Handling outbound reply", loggerOptions);

  // Run tracking and outbound reply handling concurrently
  // The individual functions handle their own operational errors.
  const [trackingResult, outboundResult] = await Promise.allSettled([
    trackSentDraftStatus({
      emailAccountId: emailAccount.id,
      message,
      gmail,
    }),
    handleOutboundReply({ emailAccount, message, gmail }),
  ]);

  if (trackingResult.status === "rejected") {
    logger.error("Error tracking sent draft status", {
      ...loggerOptions,
      error: formatError(trackingResult.reason),
    });
  }

  if (outboundResult.status === "rejected") {
    logger.error("Error handling outbound reply", {
      ...loggerOptions,
      error: formatError(outboundResult.reason),
    });
  }

  // Run cleanup for any other old/unmodified drafts in the thread
  // Must happen after previous steps
  try {
    await cleanupThreadAIDrafts({
      threadId: message.threadId,
      emailAccountId: emailAccount.id,
      gmail,
    });
  } catch (cleanupError) {
    logger.error("Error during thread draft cleanup", {
      ...loggerOptions,
      error: cleanupError,
    });
  }

  // Still skip further processing for outbound emails
  return;
}

export function shouldRunColdEmailBlocker(
  coldEmailBlocker: ColdEmailSetting | null,
  hasAiAccess: boolean,
) {
  return (
    (coldEmailBlocker === ColdEmailSetting.ARCHIVE_AND_READ_AND_LABEL ||
      coldEmailBlocker === ColdEmailSetting.ARCHIVE_AND_LABEL ||
      coldEmailBlocker === ColdEmailSetting.LABEL) &&
    hasAiAccess
  );
}

/**
 * Cache categorization metadata only (not full email content)
 * Full email data is queried from Gmail API in real-time
 */
async function cacheEmailCategorization({
  messageId,
  threadId,
  parsedMessage,
  emailAccountId,
}: {
  messageId: string;
  threadId: string;
  parsedMessage: ParsedMessage;
  emailAccountId: string;
}) {
  const subject = parsedMessage.headers.subject || "(No subject)";
  const snippet = parsedMessage.snippet || "";
  const date = internalDateToDate(parsedMessage.internalDate);

  if (!date) {
    logger.warn("No date for email, skipping categorization cache", {
      messageId,
      threadId,
    });
    return;
  }

  // Apply rule-based categorization (free & instant)
  const categorization = categorizeWithRules({
    from: parsedMessage.headers.from,
    subject,
    snippet,
  });

  const isRuleBased = categorization.method === "rule-based";

  // ALWAYS cache the email, even if it doesn't match rules
  // Emails without rule-based matches will have null priority/category
  // These will be picked up by the cron job for AI categorization
  try {
    await prisma.emailCategorization.upsert({
      where: {
        emailAccountId_messageId: {
          emailAccountId,
          messageId,
        },
      },
      create: {
        messageId,
        threadId,
        date,
        priority: categorization.priority, // null if needs AI
        category: categorization.category, // null if needs AI
        reasoning: categorization.reasoning, // null if needs AI
        emailAccountId,
      },
      update: {
        priority: categorization.priority,
        category: categorization.category,
        reasoning: categorization.reasoning,
      },
    });

    if (isRuleBased) {
      logger.info(`Cached rule-based categorization: ${categorization.priority}/${categorization.category}`, {
        messageId,
        threadId,
      });
    } else {
      logger.info("Cached uncategorized email for AI processing", {
        messageId,
        threadId,
      });
    }
  } catch (error) {
    logger.error("Failed to cache categorization", {
      messageId,
      threadId,
      error: formatError(error),
    });
  }
}
