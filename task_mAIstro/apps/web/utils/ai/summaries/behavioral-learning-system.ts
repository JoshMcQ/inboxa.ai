import "server-only";

import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("ai/behavioral-learning");

export enum BehaviorTrigger {
  VARIABLE_REWARD = "variable_reward",
  STREAK_MAINTENANCE = "streak_maintenance",
  SOCIAL_PROOF = "social_proof",
  LOSS_AVERSION = "loss_aversion",
  PROGRESS_VISUALIZATION = "progress_visualization",
}

export enum UserBehaviorType {
  SUMMARY_VIEWED = "summary_viewed",
  SUMMARY_ACTED_ON = "summary_acted_on",
  SUMMARY_DISMISSED = "summary_dismissed",
  STREAK_ACHIEVED = "streak_achieved",
}

export interface UserBehaviorEvent {
  behaviorType: UserBehaviorType;
  threadId?: string;
  summaryId?: string;
  engagement?: number;
  timestamp: Date;
}

export interface UserPersonalization {
  emailAccountId: string;
  preferredSummaryLength: "brief" | "detailed";
  primaryFocus: "action_items" | "insights" | "context";
  peakEngagementTimes: string[];
  currentStreak: number;
  totalSummariesViewed: number;
  lastActivityAt?: Date;
  habitStrength: number;
  updatedAt: Date;
}

type InMemoryState = {
  personalization: UserPersonalization;
  events: UserBehaviorEvent[];
};

const memoryStore = new Map<string, InMemoryState>();

function createDefaultPersonalization(emailAccountId: string): UserPersonalization {
  const now = new Date();
  return {
    emailAccountId,
    preferredSummaryLength: "detailed",
    primaryFocus: "action_items",
    peakEngagementTimes: ["9", "14", "17"],
    currentStreak: 0,
    totalSummariesViewed: 0,
    habitStrength: 0,
    updatedAt: now,
  };
}

export class BehavioralLearningSystem {
  private readonly emailAccountId: string;

  constructor(emailAccountId: string) {
    this.emailAccountId = emailAccountId;
  }

  private ensureState(): InMemoryState {
    let state = memoryStore.get(this.emailAccountId);
    if (!state) {
      state = {
        personalization: createDefaultPersonalization(this.emailAccountId),
        events: [],
      };
      memoryStore.set(this.emailAccountId, state);
    }
    return state;
  }

  async initialize(): Promise<UserPersonalization> {
    return this.ensureState().personalization;
  }

  async recordBehavior(event: Omit<UserBehaviorEvent, "timestamp">): Promise<void> {
    const state = this.ensureState();
    const timestampedEvent: UserBehaviorEvent = {
      ...event,
      timestamp: new Date(),
    };
    state.events.push(timestampedEvent);
    state.events.splice(0, state.events.length - 50); // keep last 50 events to bound memory

    const personalization = state.personalization;
    personalization.totalSummariesViewed += 1;
    personalization.currentStreak = Math.min(personalization.currentStreak + 1, 365);
    personalization.lastActivityAt = timestampedEvent.timestamp;
    personalization.habitStrength = Math.min(100, personalization.habitStrength + 1);
    personalization.updatedAt = timestampedEvent.timestamp;

    logger.info("Recorded behavior event", {
      emailAccountId: this.emailAccountId,
      behaviorType: event.behaviorType,
    });
  }

  async getPersonalizationWeights(): Promise<{
    urgencyWeight: number;
    relationshipWeight: number;
    businessImpactWeight: number;
    timeManagementWeight: number;
    preferredCategories: string[];
    summaryStyle: {
      length: "brief" | "detailed";
      focus: "action_items" | "insights" | "context";
    };
  }> {
    const personalization = await this.initialize();
    return {
      urgencyWeight: 0.6,
      relationshipWeight: 0.4,
      businessImpactWeight: 0.5,
      timeManagementWeight: 0.5,
      preferredCategories: [],
      summaryStyle: {
        length: personalization.preferredSummaryLength,
        focus: personalization.primaryFocus,
      },
    };
  }

  async getBehavioralTriggers(): Promise<{
    trigger: BehaviorTrigger;
    message: string;
    urgency: "low" | "medium" | "high";
  }[]> {
    const personalization = await this.initialize();
    if (personalization.currentStreak === 0) {
      return [];
    }

    return [
      {
        trigger: BehaviorTrigger.STREAK_MAINTENANCE,
        message: `Keep your ${personalization.currentStreak}-day streak alive with a quick summary review`,
        urgency: personalization.currentStreak > 3 ? "medium" : "low",
      },
    ];
  }

  async updateHabitStrength(): Promise<number> {
    const personalization = await this.initialize();
    // Recalculate a simple habit score from streak + usage.
    personalization.habitStrength = Math.min(
      100,
      personalization.currentStreak * 2 + personalization.totalSummariesViewed,
    );
    personalization.updatedAt = new Date();
    return personalization.habitStrength;
  }

  async getSmartNotificationTiming(): Promise<{
    shouldNotify: boolean;
    optimalTime?: Date;
    reason: string;
    urgency: "low" | "medium" | "high";
  }> {
    const personalization = await this.initialize();
    const lastActivity = personalization.lastActivityAt;
    if (!lastActivity) {
      return {
        shouldNotify: true,
        reason: "No activity yet – encourage first-time use",
        urgency: "medium",
      };
    }

    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity > 24) {
      return {
        shouldNotify: true,
        reason: "User inactive for 24h",
        urgency: "high",
      };
    }

    return {
      shouldNotify: false,
      reason: "Recent activity detected",
      urgency: "low",
    };
  }
}
