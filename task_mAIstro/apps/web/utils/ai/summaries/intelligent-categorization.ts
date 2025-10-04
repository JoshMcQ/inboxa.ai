import type { Thread } from "@/components/email-list/types";

// Thread summary payload brought over the wire when we request summaries.
// We re-declare the shape locally to avoid pulling server-only modules into the client bundle.
type SummaryMessage = {
  id?: string;
  from?: string | null;
  to?: string | null;
  date?: string | null;
  textPlain?: string | null;
  textHtml?: string | null;
};

type SummaryThreadLike = {
  threadId?: string;
  subject?: string | null;
  snippet?: string | null;
  category?: string | null;
  isImportant?: boolean | null;
  messages: SummaryMessage[];
};

// Enhanced marketing detection patterns. These are heuristics only – they must stay lightweight
// so they can run on every render in the client.
const MARKETING_DOMAINS = [
  // Streaming & Entertainment
  "hulu.com",
  "hulumail.com",
  "netflix.com",
  "spotify.com",
  "youtube.com",
  "disney.com",
  "hbomax.com",
  "paramount.com",
  "fubo.tv",
  "fubotv.com",

  // E-commerce & Retail
  "amazon.com",
  "amazon.co.uk",
  "ebay.com",
  "etsy.com",
  "shopify.com",
  "touchofmodern.com",
  "wayfair.com",
  "overstock.com",
  "zappos.com",

  // Fashion & Apparel
  "rvca.com",
  "nike.com",
  "adidas.com",
  "underarmour.com",
  "levi.com",
  "gap.com",
  "oldnavy.com",
  "hm.com",
  "zara.com",
  "uniqlo.com",

  // Tech & Electronics
  "apple.com",
  "microsoft.com",
  "google.com",
  "samsung.com",
  "best-buy.com",
  "bestbuy.com",
  "newegg.com",
  "tigerdirect.com",

  // Music & Audio
  "guitarcenter.com",
  "sweetwater.com",
  "musiciansfriend.com",
  "reverb.com",
  "fender.com",
  "gibson.com",

  // Finance & Crypto
  "crypto.com",
  "coinbase.com",
  "binance.com",
  "robinhood.com",
  "chase.com",
  "bankofamerica.com",
  "wellsfargo.com",

  // Real Estate
  "redfin.com",
  "zillow.com",
  "realtor.com",
  "apartments.com",
  "rent.com",
  "trulia.com",

  // Events & Entertainment
  "insomniac.com",
  "ticketmaster.com",
  "stubhub.com",
  "eventbrite.com",
  "livenation.com",
  "seatgeek.com",

  // Investment & Finance
  "microventures.com",
  "tdameritrade.com",
  "etrade.com",
  "schwab.com",
  "fidelity.com",

  // Generic marketing patterns
  "noreply@",
  "no-reply@",
  "donotreply@",
  "do-not-reply@",
  "marketing@",
  "promo@",
  "promotions@",
  "deals@",
  "offers@",
  "newsletter@",
  "news@",
  "updates@",
  "notifications@",
  "automated@",
  "auto@",
  "system@",
  "robot@",
];

const MARKETING_KEYWORDS = [
  "exclusive offer",
  "limited time",
  "special deal",
  "discount",
  "sale now",
  "save now",
  "act fast",
  "expires soon",
  "final hours",
  "clearance",
  "flash sale",
  "free shipping",
  "bonus offer",
  "upgrade now",
  "premium trial",
  "subscribe now",
  "join today",
  "no longer want",
  "manage preferences",
  "manage subscription",
  "unsubscribe",
];

const NEWSLETTER_INDICATORS = [
  "newsletter",
  "digest",
  "weekly update",
  "monthly update",
  "news roundup",
  "industry news",
  "market update",
  "trend report",
  "blog post",
  "latest articles",
  "recent posts",
];

const ACTION_KEYWORDS = [
  "please",
  "need",
  "required",
  "must",
  "should",
  "asap",
  "urgent",
  "deadline",
  "due",
  "respond",
  "reply",
  "confirm",
  "approve",
  "review",
  "check",
  "call",
  "meeting",
  "schedule",
  "book",
  "action",
  "follow up",
];

const URGENT_KEYWORDS = [
  "urgent",
  "asap",
  "emergency",
  "critical",
  "immediate",
  "now",
  "today",
  "tomorrow",
  "deadline",
  "expires",
  "final",
  "last chance",
];

export type EmailCategory =
  | "urgent"
  | "important"
  | "marketing"
  | "newsletter"
  | "social"
  | "personal"
  | "work"
  | "automated";

export interface EmailIntelligence {
  priorityScore: number; // 0-100 heuristic scoring
  trustScore: number; // 0-100 domain reputation heuristic
  category: EmailCategory;
  isMarketing: boolean;
  isNewsletter: boolean;
  hasAction: boolean;
  hasActionItems: boolean; // alias for backwards compatibility
  isUrgent: boolean;
  timeSensitive: boolean;
  reasoning: string[]; // short human readable rationales
  confidence: number; // 0-100 heuristic confidence
}

type HeaderAnalysis = {
  isMarketing: boolean;
  isNewsletter: boolean;
  domain: string;
  trustScore: number;
  reasons: string[];
};

type ContentAnalysis = {
  hasAction: boolean;
  timeSensitive: boolean;
  priorityScore: number;
  isMarketing: boolean;
  isNewsletter: boolean;
  reasons: string[];
};

type EmailSurface = {
  subject?: string | null;
  snippet?: string | null;
  category?: string | null;
  isImportant?: boolean | null;
  from?: string | null;
};

function extractEmail(input?: { headers?: { from?: string | null; subject?: string | null } } & SummaryMessage): {
  from?: string | null;
  subject?: string | null;
} {
  if (!input) return {};
  return {
    from: input.headers?.from ?? input.from ?? undefined,
    subject: input.headers?.subject ?? undefined,
  };
}

function analyzeFromHeader(from?: string | null): HeaderAnalysis {
  if (!from) {
    return {
      isMarketing: false,
      isNewsletter: false,
      domain: "",
      trustScore: 50,
      reasons: [],
    };
  }

  const emailMatch = from.match(/<([^>]+)>/);
  const email = (emailMatch ? emailMatch[1] : from).toLowerCase();
  const domain = email.split("@")[1] || "";

  const reasons: string[] = [];

  const isMarketingDomain = MARKETING_DOMAINS.some((marketingDomain) => {
    if (!marketingDomain.includes("@")) {
      return domain.includes(marketingDomain);
    }
    return email.includes(marketingDomain);
  });

  if (isMarketingDomain) {
    reasons.push(`Sender domain ${domain} matches marketing list`);
  }

  const isNewsletterFrom = NEWSLETTER_INDICATORS.some((indicator) =>
    from.toLowerCase().includes(indicator),
  );

  const reasonsNewsletter = isNewsletterFrom
    ? [`Sender name contains newsletter indicator (${from})`]
    : [];
  reasons.push(...reasonsNewsletter);

  let trustScore = 50;

  if (domain.endsWith(".edu") || domain.endsWith(".gov")) {
    trustScore = 90;
    reasons.push("Educational or government domain detected");
  } else if (domain.includes("gmail.com") || domain.includes("outlook.com")) {
    trustScore = 70;
    reasons.push("Common personal email provider");
  } else if (isMarketingDomain) {
    trustScore = 30;
  } else if (email.includes("noreply") || email.includes("no-reply")) {
    trustScore = 25;
    reasons.push("No-reply style sender detected");
  }

  return {
    isMarketing: isMarketingDomain,
    isNewsletter: isNewsletterFrom,
    domain,
    trustScore,
    reasons,
  };
}

function analyzeContent(subject?: string | null, snippet?: string | null): ContentAnalysis {
  const content = `${subject ?? ""} ${snippet ?? ""}`.toLowerCase();
  const reasons: string[] = [];

  const hasAction = ACTION_KEYWORDS.some((keyword) => {
    if (!keyword.trim()) return false;
    if (content.includes(keyword)) {
      reasons.push(`Found action keyword "${keyword}"`);
      return true;
    }
    return false;
  });

  const timeSensitive = URGENT_KEYWORDS.some((keyword) => {
    if (!keyword.trim()) return false;
    if (content.includes(keyword)) {
      reasons.push(`Detected urgency keyword "${keyword}"`);
      return true;
    }
    return false;
  });

  const isMarketing = MARKETING_KEYWORDS.some((keyword) => {
    if (content.includes(keyword)) {
      reasons.push(`Marketing language detected: "${keyword}"`);
      return true;
    }
    return false;
  });

  const isNewsletter = NEWSLETTER_INDICATORS.some((indicator) => {
    if (content.includes(indicator)) {
      reasons.push(`Newsletter indicator found: "${indicator}"`);
      return true;
    }
    return false;
  });

  let priorityScore = 50;
  if (timeSensitive) priorityScore += 30;
  if (hasAction) priorityScore += 20;
  if (content.includes("meeting") || content.includes("call")) priorityScore += 10;
  if (content.includes("follow up")) priorityScore += 10;
  if (isMarketing) priorityScore -= 15;
  if (isNewsletter) priorityScore -= 10;

  priorityScore = Math.max(0, Math.min(100, priorityScore));

  return {
    hasAction,
    timeSensitive,
    priorityScore,
    isMarketing,
    isNewsletter,
    reasons,
  };
}

function determineCategory({
  contentAnalysis,
  headerAnalysis,
  isImportant,
  fallbackCategory,
}: {
  contentAnalysis: ContentAnalysis;
  headerAnalysis: HeaderAnalysis;
  isImportant?: boolean | null;
  fallbackCategory?: string | null;
}): EmailCategory {
  if (contentAnalysis.timeSensitive && contentAnalysis.priorityScore >= 80) {
    return "urgent";
  }

  if (isImportant || contentAnalysis.priorityScore >= 65) {
    return "important";
  }

  if (headerAnalysis.isMarketing || contentAnalysis.isMarketing) {
    return "marketing";
  }

  if (headerAnalysis.isNewsletter || contentAnalysis.isNewsletter) {
    return "newsletter";
  }

  if (fallbackCategory) {
    const normalized = fallbackCategory.toLowerCase();
    if (normalized.includes("social")) return "social";
    if (normalized.includes("work") || normalized.includes("internal")) return "work";
    if (normalized.includes("automated")) return "automated";
  }

  if (headerAnalysis.domain && !headerAnalysis.domain.includes("gmail") && !headerAnalysis.domain.includes("outlook")) {
    return "work";
  }

  return "personal";
}

function buildEmailIntelligence(surface: EmailSurface): EmailIntelligence {
  const headerAnalysis = analyzeFromHeader(surface.from);
  const contentAnalysis = analyzeContent(surface.subject, surface.snippet);

  const category = determineCategory({
    contentAnalysis,
    headerAnalysis,
    isImportant: surface.isImportant,
    fallbackCategory: surface.category,
  });

  // Aggregate reasoning with duplicates removed to keep things readable.
  const reasoning = Array.from(
    new Set([
      ...headerAnalysis.reasons,
      ...contentAnalysis.reasons,
      category === "urgent" ? "Priority elevated due to urgent language" : null,
      category === "important" && surface.isImportant ? "Marked important in mailbox" : null,
      category === "marketing" ? "Classified as marketing through heuristics" : null,
    ].filter(Boolean) as string[]),
  );

  let confidence = 60;
  if (headerAnalysis.domain) confidence += 10;
  if (contentAnalysis.hasAction) confidence += 5;
  if (contentAnalysis.timeSensitive) confidence += 5;
  if (headerAnalysis.isMarketing && contentAnalysis.isMarketing) confidence += 10;
  confidence = Math.min(100, confidence);

  return {
    priorityScore: contentAnalysis.priorityScore,
    trustScore: headerAnalysis.trustScore,
    category,
    isMarketing: headerAnalysis.isMarketing || contentAnalysis.isMarketing,
    isNewsletter: headerAnalysis.isNewsletter || contentAnalysis.isNewsletter,
    hasAction: contentAnalysis.hasAction,
    hasActionItems: contentAnalysis.hasAction,
    isUrgent: contentAnalysis.timeSensitive,
    timeSensitive: contentAnalysis.timeSensitive,
    reasoning,
    confidence,
  };
}

function getSurfaceFromThread(thread: Thread): EmailSurface {
  const latest = thread.messages?.[thread.messages.length - 1];

  const { from, subject } = extractEmail(latest as unknown as SummaryMessage & {
    headers?: { from?: string | null; subject?: string | null };
  });

  return {
    from,
    subject: subject ?? thread.messages?.[thread.messages.length - 1]?.headers?.subject ?? thread.snippet,
    snippet: thread.snippet,
    category: thread.category?.category,
    isImportant: thread.messages?.some((message) =>
      message.labelIds?.includes("IMPORTANT"),
    ) ?? false,
  };
}

function getSurfaceFromSummaryThread(thread: SummaryThreadLike): EmailSurface {
  const latest = thread.messages[thread.messages.length - 1];
  const { from, subject } = extractEmail(latest);

  return {
    from,
    subject: subject ?? thread.subject ?? thread.snippet,
    snippet: thread.snippet,
    category: thread.category,
    isImportant: thread.isImportant ?? false,
  };
}

export function analyzeEmailIntelligence(thread: Thread): EmailIntelligence {
  return buildEmailIntelligence(getSurfaceFromThread(thread));
}

export function shouldExcludeThread(
  thread: Thread,
  intelligence: EmailIntelligence,
  filters: {
    excludeMarketing?: boolean;
    excludeNewsletters?: boolean;
    excludeLowPriority?: boolean;
    minPriorityScore?: number;
    onlyActionable?: boolean;
  },
): boolean {
  if (filters.excludeMarketing && intelligence.isMarketing) {
    return true;
  }

  if (filters.excludeNewsletters && intelligence.isNewsletter) {
    return true;
  }

  if (filters.excludeLowPriority && intelligence.priorityScore < 40) {
    return true;
  }

  if (typeof filters.minPriorityScore === "number" && intelligence.priorityScore < filters.minPriorityScore) {
    return true;
  }

  if (filters.onlyActionable && !intelligence.hasAction) {
    return true;
  }

  return false;
}

type InteractionEvent = {
  opened?: boolean;
  acted?: boolean;
  timestamp?: Date;
};

const interactionStore = new Map<string, InteractionEvent[]>();

export class IntelligentEmailCategorizer {
  analyzeThread(thread: SummaryThreadLike, userContext?: { priorities?: string[] }): EmailIntelligence {
    const intelligence = buildEmailIntelligence(getSurfaceFromSummaryThread(thread));

    if (userContext?.priorities && userContext.priorities.length > 0) {
      const lowerSubject = (thread.subject ?? "").toLowerCase();
      const matchedPriority = userContext.priorities.find((priority) =>
        lowerSubject.includes(priority.toLowerCase()),
      );

      if (matchedPriority) {
        intelligence.priorityScore = Math.min(100, intelligence.priorityScore + 5);
        intelligence.reasoning = Array.from(
          new Set([...intelligence.reasoning, `Subject references user priority "${matchedPriority}"`]),
        );
      }
    }

    return intelligence;
  }

  recordUserInteraction(threadId: string, event: InteractionEvent): void {
    const events = interactionStore.get(threadId) ?? [];
    events.push({ ...event, timestamp: event.timestamp ?? new Date() });
    interactionStore.set(threadId, events.slice(-20)); // keep the last 20 interactions in-memory
  }
}
