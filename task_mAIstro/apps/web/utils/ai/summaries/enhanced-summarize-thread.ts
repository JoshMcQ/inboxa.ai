import "server-only";

import { z } from "zod";
import { chatCompletionObject } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { createScopedLogger } from "@/utils/logger";
import { emailToContent } from "@/utils/mail";
import type {
  ThreadSummaryPayload,
  ThreadSummaryResult,
} from "@/app/api/ai/summaries/validation";
import {
  getThreadSummaryCache,
  setThreadSummaryCache,
} from "@/utils/redis/thread-summaries";
import {
  IntelligentEmailCategorizer,
  type EmailIntelligence
} from "./intelligent-categorization";

const logger = createScopedLogger("ai/enhanced-summaries");

// Enhanced schema for actionable insights
const enhancedSummarySchema = z.object({
  threadHeadline: z.string().min(1).max(150),

  // Strategic insights instead of basic bullets
  strategicInsights: z.array(z.string()).max(4).describe(
    "Key strategic insights, implications, or hidden patterns - not obvious facts"
  ),

  // Specific, time-bound action items
  actionItems: z.array(z.object({
    action: z.string().min(1),
    urgency: z.enum(["immediate", "today", "this_week", "ongoing"]),
    importance: z.enum(["critical", "high", "medium", "low"]),
    estimatedTime: z.string().optional().describe("e.g., '5 min', '30 min', '2 hours'"),
    dependencies: z.array(z.string()).optional().describe("What's needed to complete this")
  })).max(5),

  // Business impact analysis
  businessImpact: z.object({
    level: z.enum(["high", "medium", "low", "none"]),
    areas: z.array(z.enum(["revenue", "costs", "timeline", "relationships", "reputation", "strategy"])),
    description: z.string().optional()
  }).optional(),

  // Smart categorization and context
  smartContext: z.object({
    category: z.enum([
      "urgent_decision", "strategic_opportunity", "relationship_building",
      "problem_solving", "information_sharing", "routine_update", "low_priority"
    ]),
    confidence: z.number().min(0).max(100),
    reasoning: z.string(),
    relatedThreads: z.array(z.string()).optional().describe("Related thread IDs if patterns detected")
  }),

  // Time-sensitive information
  timeContext: z.object({
    hasDeadline: z.boolean(),
    deadline: z.string().optional(),
    meetingTime: z.string().optional(),
    followUpBy: z.string().optional(),
    ageInDays: z.number().optional()
  }).optional(),

  // Relationship and people insights
  peopleInsights: z.array(z.object({
    person: z.string().describe("Name or role"),
    context: z.string().describe("Their role in this thread"),
    actionNeeded: z.string().optional().describe("What they need from you or vice versa")
  })).max(3).optional(),

  // Financial or numerical insights
  quantifiedInfo: z.array(z.object({
    type: z.enum(["money", "percentage", "quantity", "timeline", "metrics"]),
    value: z.string(),
    context: z.string()
  })).max(3).optional(),

  // Emotional tone and urgency assessment
  communicationAnalysis: z.object({
    tone: z.enum(["urgent", "formal", "casual", "frustrated", "positive", "neutral"]),
    senderIntent: z.enum(["requesting", "informing", "deciding", "escalating", "following_up"]),
    responseExpected: z.boolean(),
    suggestedResponseTone: z.enum(["immediate", "thoughtful", "brief", "detailed", "acknowledgment"]).optional()
  }).optional()
});

type EnhancedSummaryResult = z.infer<typeof enhancedSummarySchema>;

interface UserContext {
  role?: string;
  priorities?: string[];
  workingHours?: { start: string; end: string };
  timezone?: string;
  communicationStyle?: string;
  currentProjects?: string[];
  keyRelationships?: string[];
}

export async function enhancedSummarizeThread({
  thread,
  emailAccount,
  since,
  userContext,
}: {
  thread: ThreadSummaryPayload;
  emailAccount: EmailAccountWithAI;
  since?: string;
  userContext?: UserContext;
}): Promise<ThreadSummaryResult> {

  const categorizer = new IntelligentEmailCategorizer();

  // Get intelligent analysis of the thread
  const intelligence = categorizer.analyzeThread(thread, userContext);

  const latestMessage = thread.messages[thread.messages.length - 1];
  const cacheKey = {
    threadId: thread.threadId,
    latestMessageId: latestMessage?.id || thread.latestMessageId,
    version: "enhanced_v2" // Increment when changing logic
  };

  const cached = await getThreadSummaryCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Build rich context for AI analysis
  const threadContext = buildEnhancedThreadContext(thread, intelligence, userContext);

  const system = buildPersonalizedSystemPrompt(userContext, intelligence);
  const prompt = buildEnhancedPrompt(thread, threadContext, intelligence, userContext);

  let enhancedResult: EnhancedSummaryResult | null = null;

  try {
    const completion = await chatCompletionObject({
      userAi: emailAccount.user,
      system,
      prompt,
      schema: enhancedSummarySchema,
      userEmail: emailAccount.email,
      usageLabel: "Enhanced thread summary",
    });

    enhancedResult = completion.object as EnhancedSummaryResult;
  } catch (error) {
    logger.error("Enhanced LLM summarization failed", {
      error,
      threadId: thread.threadId,
    });
  }

  // Convert enhanced result to standard format with fallbacks
  const summary: ThreadSummaryResult = convertToStandardFormat(
    enhancedResult,
    thread,
    intelligence
  );

  await setThreadSummaryCache(cacheKey, summary);

  // Record categorization patterns for learning
  categorizer.recordUserInteraction(thread.threadId, {
    opened: true, // Assume opened since we're summarizing
    timestamp: new Date()
  });

  return summary;
}

function buildEnhancedThreadContext(
  thread: ThreadSummaryPayload,
  intelligence: EmailIntelligence,
  userContext?: UserContext
): string {
  const messages = thread.messages.map((message, index) => {
    const content = emailToContent(
      {
        textHtml: message.textHtml || undefined,
        textPlain: message.textPlain || undefined,
        snippet: thread.snippet ?? "",
      },
      {
        maxLength: 1500, // Increased for better context
        extractReply: true,
        removeForwarded: true,
      }
    );

    const participants = [
      message.from ? `From: ${message.from}` : null,
      message.to ? `To: ${message.to}` : null,
    ].filter(Boolean).join(" | ");

    return [
      `=== Message ${index + 1} ===`,
      participants,
      `Time: ${formatMessageTime(message.date)}`,
      `Content:\n${content}`,
      ""
    ].join("\n");
  });

  const contextSections = [
    "THREAD ANALYSIS:",
    `Subject: ${thread.subject || "(no subject)"}`,
    `Category: ${thread.category || "Uncategorized"}`,
    `Intelligence Assessment: ${intelligence.reasoning.join("; ")}`,
    `Priority Score: ${intelligence.priorityScore}/100`,
    `Trust Level: ${intelligence.trustScore}/100`,
    "",
    "CONVERSATION FLOW:",
    ...messages,
  ];

  if (userContext) {
    contextSections.push(
      "",
      "USER CONTEXT:",
      `Role: ${userContext.role || "Not specified"}`,
      `Key Priorities: ${userContext.priorities?.join(", ") || "Not specified"}`,
      `Current Projects: ${userContext.currentProjects?.join(", ") || "Not specified"}`
    );
  }

  return contextSections.join("\n");
}

function buildPersonalizedSystemPrompt(userContext?: UserContext, intelligence?: EmailIntelligence): string {
  const basePrompt = `You are an AI executive assistant specializing in actionable email intelligence.

Your goal is to provide insights that save time and drive decisions, not just describe what's obvious.

CORE PRINCIPLES:
1. Focus on implications, not just facts
2. Identify hidden patterns and connections
3. Prioritize based on business impact
4. Provide specific, time-bound actions
5. Consider context and relationships
6. Flag risks and opportunities

OUTPUT REQUIREMENTS:
- Strategic insights (WHY this matters, not WHAT it says)
- Specific actions with urgency and time estimates
- Business impact assessment
- Smart categorization with confidence levels
- Time-sensitive information extraction
- People and relationship dynamics
- Communication analysis and response guidance`;

  if (userContext?.role) {
    return `${basePrompt}

USER CONTEXT:
Role: ${userContext.role}
Key focus areas: ${userContext.priorities?.join(", ") || "General business priorities"}

Tailor your analysis to this role and focus on insights most relevant to their responsibilities.`;
  }

  return basePrompt;
}

function buildEnhancedPrompt(
  thread: ThreadSummaryPayload,
  threadContext: string,
  intelligence: EmailIntelligence,
  userContext?: UserContext
): string {
  const currentTime = new Date().toISOString();
  const threadAge = calculateThreadAge(thread);

  return `CURRENT TIME: ${currentTime}
THREAD AGE: ${threadAge}

${threadContext}

INTELLIGENCE ASSESSMENT:
- Urgency: ${intelligence.isUrgent ? "HIGH" : "NORMAL"}
- Action Required: ${intelligence.hasAction ? "YES" : "NO"}
- Category: ${intelligence.category}
- Trust Level: ${intelligence.trustScore}/100

ANALYSIS FOCUS:
Generate a strategic summary that reveals insights beyond the obvious. Consider:

1. What decisions need to be made?
2. What relationships are at stake?
3. What opportunities or risks are hidden?
4. What would someone miss if they only skimmed this?
5. How does this connect to broader business context?
6. What's the real urgency and why?

Provide actionable intelligence that makes someone think "I'm glad I didn't miss this detail" rather than "this just tells me what I already saw."`;
}

function convertToStandardFormat(
  enhanced: EnhancedSummaryResult | null,
  thread: ThreadSummaryPayload,
  intelligence: EmailIntelligence
): ThreadSummaryResult {

  if (!enhanced) {
    // Intelligent fallback using categorization data
    return createIntelligentFallback(thread, intelligence);
  }

  // Convert enhanced action items to simple strings
  const actionItems = enhanced.actionItems.map(item => {
    const urgencyFlag = item.urgency === "immediate" ? "🔴 " :
                       item.urgency === "today" ? "🟡 " : "";
    const timeEst = item.estimatedTime ? ` (${item.estimatedTime})` : "";
    return `${urgencyFlag}${item.action}${timeEst}`;
  });

  // Convert strategic insights to thread bullets
  const threadBullets = enhanced.strategicInsights.length > 0
    ? enhanced.strategicInsights
    : [`Category: ${enhanced.smartContext.category}`, `Confidence: ${enhanced.smartContext.confidence}%`];

  // Create rich key facts from various data points
  const keyFacts = [];

  if (enhanced.businessImpact && enhanced.businessImpact.level !== "none") {
    keyFacts.push({
      label: "Business Impact",
      value: `${enhanced.businessImpact.level} - ${enhanced.businessImpact.areas.join(", ")}`
    });
  }

  if (enhanced.timeContext?.hasDeadline && enhanced.timeContext.deadline) {
    keyFacts.push({
      label: "Deadline",
      value: enhanced.timeContext.deadline
    });
  }

  if (enhanced.communicationAnalysis) {
    keyFacts.push({
      label: "Response Needed",
      value: enhanced.communicationAnalysis.responseExpected ?
        `Yes (${enhanced.communicationAnalysis.suggestedResponseTone || "standard"} tone)` : "No"
    });
  }

  if (enhanced.quantifiedInfo && enhanced.quantifiedInfo.length > 0) {
    enhanced.quantifiedInfo.forEach(info => {
      keyFacts.push({
        label: info.type.charAt(0).toUpperCase() + info.type.slice(1),
        value: `${info.value} - ${info.context}`
      });
    });
  }

  // Generate a contextual latest message summary
  const latestMessageSummary = generateContextualSummary(enhanced, intelligence);

  return {
    threadId: thread.threadId,
    threadHeadline: enhanced.threadHeadline,
    threadBullets,
    latestMessageSummary,
    actionItems,
    keyFacts: keyFacts.slice(0, 5), // Limit to 5 as per schema
    generatedAt: new Date().toISOString(),
  };
}

function createIntelligentFallback(
  thread: ThreadSummaryPayload,
  intelligence: EmailIntelligence
): ThreadSummaryResult {
  const subject = thread.subject || "Email thread";
  const category = intelligence.category.replace(/_/g, " ");

  const fallbackBullets = [
    `Classified as: ${category}`,
    `Priority score: ${intelligence.priorityScore}/100`,
    ...(intelligence.isUrgent ? ["⚠️ Marked as urgent"] : []),
    ...(intelligence.hasAction ? ["✅ Action required"] : []),
  ].slice(0, 4);

  const fallbackActions = [];
  if (intelligence.hasAction) {
    fallbackActions.push("Review and determine required action");
  }
  if (intelligence.isUrgent) {
    fallbackActions.push("Respond promptly due to urgency indicators");
  }

  return {
    threadId: thread.threadId,
    threadHeadline: `${subject} (${category})`,
    threadBullets: fallbackBullets,
    latestMessageSummary: `${category} email with ${intelligence.priorityScore}/100 priority score`,
    actionItems: fallbackActions,
    keyFacts: [
      { label: "Category", value: category },
      { label: "Trust Score", value: `${intelligence.trustScore}/100` }
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateContextualSummary(enhanced: EnhancedSummaryResult, intelligence: EmailIntelligence): string {
  const parts = [];

  if (enhanced.communicationAnalysis) {
    const { senderIntent, tone } = enhanced.communicationAnalysis;
    parts.push(`${senderIntent} with ${tone} tone`);
  }

  if (enhanced.businessImpact && enhanced.businessImpact.level !== "none") {
    parts.push(`${enhanced.businessImpact.level} business impact`);
  }

  if (enhanced.timeContext?.hasDeadline) {
    parts.push("time-sensitive");
  }

  if (enhanced.peopleInsights && enhanced.peopleInsights.length > 0) {
    const keyPeople = enhanced.peopleInsights.map(p => p.person).join(", ");
    parts.push(`involves ${keyPeople}`);
  }

  return parts.length > 0
    ? parts.join(", ").charAt(0).toUpperCase() + parts.join(", ").slice(1)
    : `${enhanced.smartContext.category.replace(/_/g, " ")} with ${enhanced.smartContext.confidence}% confidence`;
}

function formatMessageTime(dateString?: string): string {
  if (!dateString) return "Unknown time";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;

    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

function calculateThreadAge(thread: ThreadSummaryPayload): string {
  const latestMessage = thread.messages[thread.messages.length - 1];
  if (!latestMessage?.date) return "Unknown age";

  return formatMessageTime(latestMessage.date);
}