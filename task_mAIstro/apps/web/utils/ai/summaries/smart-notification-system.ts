import "server-only";

import { createScopedLogger } from "@/utils/logger";
import {
  BehavioralLearningSystem,
  type UserBehaviorEvent,
} from "./behavioral-learning-system";

const logger = createScopedLogger("ai/smart-notifications");

export enum NotificationType {
  URGENT_SUMMARY = "urgent_summary",
  STREAK_REMINDER = "streak_reminder",
  VARIABLE_REWARD = "variable_reward",
}

export enum RewardSchedule {
  FIXED_INTERVAL = "fixed_interval",
  VARIABLE_INTERVAL = "variable_interval",
}

export interface SmartNotification {
  id: string;
  emailAccountId: string;
  type: NotificationType;
  schedule: RewardSchedule;
  title: string;
  message: string;
  urgency: "low" | "medium" | "high";
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  emailAccountId: string;
  quietHours: { start: string; end: string };
  maxNotificationsPerDay: number;
  enabledTypes: NotificationType[];
}

const generatedNotifications = new Map<string, SmartNotification[]>();

export class SmartNotificationSystem {
  private readonly emailAccountId: string;
  private readonly behavioralSystem: BehavioralLearningSystem;

  constructor(emailAccountId: string) {
    this.emailAccountId = emailAccountId;
    this.behavioralSystem = new BehavioralLearningSystem(emailAccountId);
  }

  async generateSmartNotifications(): Promise<SmartNotification[]> {
    const personalization = await this.behavioralSystem.initialize();

    const notifications: SmartNotification[] = [];

    if (personalization.currentStreak > 0) {
      notifications.push({
        id: `${this.emailAccountId}-streak-${Date.now()}`,
        emailAccountId: this.emailAccountId,
        type: NotificationType.STREAK_REMINDER,
        schedule: RewardSchedule.VARIABLE_INTERVAL,
        title: "Keep your streak going",
        message: `You are on a ${personalization.currentStreak}-day streak. Review your summaries to keep it alive!`,
        urgency: personalization.currentStreak > 3 ? "medium" : "low",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      });
    }

    generatedNotifications.set(this.emailAccountId, notifications);
    return notifications;
  }

  async recordNotificationInteraction(event: Omit<UserBehaviorEvent, "timestamp">): Promise<void> {
    await this.behavioralSystem.recordBehavior({
      behaviorType: event.behaviorType,
      summaryId: event.summaryId,
      threadId: event.threadId,
      engagement: event.engagement,
    });
  }

  async listPendingNotifications(): Promise<SmartNotification[]> {
    return generatedNotifications.get(this.emailAccountId) ?? [];
  }

  async clearNotifications(): Promise<void> {
    generatedNotifications.delete(this.emailAccountId);
  }
}
