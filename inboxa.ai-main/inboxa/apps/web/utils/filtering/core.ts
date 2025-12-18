/**
 * Minimal, pure TypeScript email filtering core.
 *
 * Inputs: Basic metadata about an email (from, subject, headers, body snippets)
 * Output: A classification decision with a score and reasons
 *
 * Design goals:
 * - No external deps, no Next/Prisma imports
 * - Deterministic rules with simple weights
 * - Safe default of "unknown" when no strong signal
 */

export type EmailInput = {
  from?: string;
  subject?: string;
  headers?: Record<string, string | undefined>;
  text?: string;
  html?: string;
};

export type Decision =
  | "marketing"
  | "newsletter"
  | "transactional"
  | "important"
  | "unknown";

export type Classification = {
  decision: Decision;
  score: number; // 0-100 indicative score, not calibrated
  reasons: string[];
  features: Record<string, unknown>;
};

export type FilterOptions = {
  vipDomains?: string[]; // If sender domain matches, mark important
  marketingDomains?: string[];
};

const DEFAULT_MARKETING_DOMAINS = [
  // Common ESPs and marketing platforms
  "mailchimp.com",
  "sendgrid.net",
  "amazonses.com",
  "campaignmonitor.com",
  "mandrillapp.com",
  "sparkpostmail.com",
  "hubspotemail.net",
  "mailerlite.com",
  "news.mail", // generic subdomain pattern
];

const PROMO_KEYWORDS = [
  "sale",
  "discount",
  "deal",
  "offer",
  "save",
  "limited time",
  "percent off",
  "% off",
  "promo",
];

const NEWSLETTER_KEYWORDS = [
  "newsletter",
  "weekly",
  "daily",
  "digest",
  "roundup",
  "edition",
];

const TRANSACTIONAL_KEYWORDS = [
  "receipt",
  "invoice",
  "order",
  "shipping",
  "delivery",
  "payment",
  "confirmation",
  "reset your password",
];

function getDomain(email?: string): string | undefined {
  if (!email) return undefined;
  const match = email.toLowerCase().match(/@([^>\s]+)>?$|@([^>\s]+)$/);
  const domain = match?.[1] || match?.[2];
  return domain?.replace(/^\[/, "").replace(/\]$/, "");
}

function includesAny(haystack: string, needles: string[]): number {
  const s = haystack.toLowerCase();
  return needles.reduce((acc, n) => (s.includes(n) ? acc + 1 : acc), 0);
}

function looksLikeList(headers?: Record<string, string | undefined>): boolean {
  if (!headers) return false;
  const listId = headers["list-id"] || headers["List-Id"];
  const listUnsub = headers["list-unsubscribe"] || headers["List-Unsubscribe"];
  const precedence = headers["precedence"] || headers["Precedence"];
  return Boolean(listId || listUnsub || (precedence && /bulk|list/i.test(precedence)));
}

export function classifyEmail(input: EmailInput, opts: FilterOptions = {}): Classification {
  const reasons: string[] = [];
  let score = 0;

  const fromDomain = getDomain(input.from);
  const subject = input.subject?.toLowerCase() || "";
  const text = (input.text || "").toLowerCase();
  const html = (input.html || "").toLowerCase();
  const headers = input.headers || {};

  const vipMatch = fromDomain && (opts.vipDomains || []).some((d) => fromDomain.endsWith(d));
  if (vipMatch) {
    reasons.push("VIP domain match");
    return {
      decision: "important",
      score: 90,
      reasons,
      features: { fromDomain },
    };
  }

  // Marketing detection
  const marketingDomains = opts.marketingDomains || DEFAULT_MARKETING_DOMAINS;
  const marketingDomainHit = fromDomain && marketingDomains.find((d) => fromDomain.endsWith(d));
  const promoHits = includesAny(subject, PROMO_KEYWORDS) + includesAny(text, PROMO_KEYWORDS);
  const hasUnsubscribe =
    html.includes("unsubscribe") || text.includes("unsubscribe") || looksLikeList(headers);

  let marketingScore = 0;
  if (marketingDomainHit) {
    marketingScore += 40;
    reasons.push(`From marketing domain: ${marketingDomainHit}`);
  }
  if (promoHits > 0) {
    marketingScore += Math.min(30, promoHits * 10);
    reasons.push(`Promotional keywords: ${promoHits}`);
  }
  if (hasUnsubscribe) {
    marketingScore += 15;
    reasons.push("Has unsubscribe/List headers");
  }

  // Newsletter detection
  const newsletterHits = includesAny(subject, NEWSLETTER_KEYWORDS) + includesAny(text, NEWSLETTER_KEYWORDS);
  const listHeaders = looksLikeList(headers);
  let newsletterScore = 0;
  if (newsletterHits > 0) {
    newsletterScore += Math.min(30, newsletterHits * 10);
    reasons.push(`Newsletter keywords: ${newsletterHits}`);
  }
  if (listHeaders) {
    newsletterScore += 30;
    reasons.push("List-Id/List headers present");
  }

  // Transactional detection
  const transactionalHits =
    includesAny(subject, TRANSACTIONAL_KEYWORDS) + includesAny(text, TRANSACTIONAL_KEYWORDS);
  let transactionalScore = 0;
  if (transactionalHits > 0) {
    transactionalScore += Math.min(40, transactionalHits * 15);
    reasons.push(`Transactional keywords: ${transactionalHits}`);
  }
  if (fromDomain?.startsWith("no-reply.") || input.from?.toLowerCase().includes("no-reply@")) {
    transactionalScore += 10;
    reasons.push("No-reply sender");
  }

  // Decide
  const candidates: Array<{ decision: Decision; s: number }> = [
    { decision: "marketing", s: marketingScore },
    { decision: "newsletter", s: newsletterScore },
    { decision: "transactional", s: transactionalScore },
  ];
  candidates.sort((a, b) => b.s - a.s);
  const top = candidates[0];

  if (!top || top.s < 25) {
    return {
      decision: "unknown",
      score: top?.s ?? 0,
      reasons: reasons.length ? reasons : ["No strong signals"],
      features: {
        fromDomain,
        promoHits,
        newsletterHits,
        transactionalHits,
        hasUnsubscribe,
      },
    };
  }

  score = Math.min(95, top.s + 5);
  return {
    decision: top.decision,
    score,
    reasons,
    features: {
      fromDomain,
      marketingDomainHit: marketingDomainHit || null,
      hasUnsubscribe,
      promoHits,
      newsletterHits,
      transactionalHits,
    },
  };
}
