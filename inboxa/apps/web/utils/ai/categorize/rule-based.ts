/**
 * Rule-based email categorization (FREE, instant)
 *
 * Handles 60-70% of emails using keyword patterns:
 * - Security alerts → urgent
 * - Bills & account notices → important
 * - Newsletters & marketing → newsletters/low
 * - Team/work emails → important
 * - Everything else → null (will be categorized by AI batch processor)
 */

type EmailInput = {
  from: string;
  subject: string;
  snippet: string;
};

export type CategorizationResult = {
  priority: "urgent" | "important" | "normal" | "low" | null;
  category: "urgent" | "important" | "newsletters" | "team" | "other" | null;
  reasoning: string | null;
  method: "rule-based" | "needs-ai";
};

// Security keywords that indicate urgent emails
const SECURITY_KEYWORDS = [
  "security alert",
  "suspicious activity",
  "unusual sign-in",
  "password reset",
  "account locked",
  "verify your identity",
  "two-factor",
  "2fa",
  "verification code",
  "suspicious login",
  "account compromised",
  "security breach",
  "unauthorized access",
];

// Billing keywords that indicate important emails
const BILLING_KEYWORDS = [
  "bill",
  "invoice",
  "payment",
  "receipt",
  "charge",
  "subscription",
  "renewal",
  "payment failed",
  "card declined",
  "overdue",
  "past due",
  "billing statement",
];

// Newsletter/marketing keywords that indicate low priority
const NEWSLETTER_KEYWORDS = [
  "unsubscribe",
  "view in browser",
  "update preferences",
  "manage subscription",
  "you're receiving this",
  "sent to",
  "weekly digest",
  "daily digest",
  "newsletter",
  "promotional",
];

// Marketing/promotional senders
const MARKETING_DOMAINS = [
  "marketing",
  "promo",
  "news",
  "newsletter",
  "noreply",
  "no-reply",
  "donotreply",
  "updates",
  "notifications",
];

// Team/work keywords
const TEAM_KEYWORDS = [
  "meeting",
  "calendar",
  "invitation",
  "agenda",
  "standup",
  "sync",
  "review",
  "pull request",
  "pr:",
  "merge request",
];

/**
 * Check if text contains any of the keywords (case insensitive)
 */
function containsKeyword(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Check if sender domain matches marketing patterns
 */
function isMarketingSender(from: string): boolean {
  const lowerFrom = from.toLowerCase();
  return MARKETING_DOMAINS.some((domain) => lowerFrom.includes(domain));
}

/**
 * Categorize email using rule-based patterns
 * Returns null if email doesn't match any rules (needs AI categorization)
 */
export function categorizeWithRules(
  email: EmailInput,
): CategorizationResult {
  const { from, subject, snippet } = email;
  const content = `${subject} ${snippet}`.toLowerCase();

  // URGENT: Security alerts
  if (containsKeyword(content, SECURITY_KEYWORDS)) {
    return {
      priority: "urgent",
      category: "urgent",
      reasoning: "Security alert detected (password reset, suspicious activity, etc.)",
      method: "rule-based",
    };
  }

  // IMPORTANT: Bills and account notices
  if (containsKeyword(content, BILLING_KEYWORDS)) {
    return {
      priority: "important",
      category: "important",
      reasoning: "Bill or payment notice",
      method: "rule-based",
    };
  }

  // LOW: Newsletters and marketing
  if (
    containsKeyword(content, NEWSLETTER_KEYWORDS) ||
    isMarketingSender(from)
  ) {
    return {
      priority: "low",
      category: "newsletters",
      reasoning: "Newsletter or marketing email",
      method: "rule-based",
    };
  }

  // IMPORTANT: Team/work emails
  if (containsKeyword(content, TEAM_KEYWORDS)) {
    return {
      priority: "important",
      category: "team",
      reasoning: "Team communication (meeting, PR, etc.)",
      method: "rule-based",
    };
  }

  // No rule matched - needs AI categorization
  return {
    priority: null,
    category: null,
    reasoning: null,
    method: "needs-ai",
  };
}

/**
 * Batch categorize multiple emails with rules
 * Returns separate lists for categorized and uncategorized emails
 */
export function batchCategorizeWithRules(emails: EmailInput[]): {
  categorized: Array<EmailInput & CategorizationResult>;
  needsAI: EmailInput[];
} {
  const categorized: Array<EmailInput & CategorizationResult> = [];
  const needsAI: EmailInput[] = [];

  for (const email of emails) {
    const result = categorizeWithRules(email);

    if (result.method === "rule-based") {
      categorized.push({ ...email, ...result });
    } else {
      needsAI.push(email);
    }
  }

  return { categorized, needsAI };
}
