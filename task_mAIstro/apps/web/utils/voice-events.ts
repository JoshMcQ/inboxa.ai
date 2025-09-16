// Shared voice/planner Server-Sent Events emitter and helpers
export interface VoiceEvent {
  type:
    | "agent_step"
    | "email_action"
    | "draft_created"
    | "conversation_started"
    | "conversation_ended"
    | "undo_available"
    | "undo_completed"
    | "undo_failed"
    | "planner_updated";
  data: any;
}

class VoiceEventEmitter {
  private clients = new Map<string, ReadableStreamDefaultController>();

  addClient(clientId: string, controller: ReadableStreamDefaultController) {
    this.clients.set(clientId, controller);
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  emit(emailAccountId: string, event: VoiceEvent) {
    const eventData = {
      type: event.type,
      data: event.data,
      timestamp: new Date().toISOString(),
      emailAccountId,
    };

    const message = `data: ${JSON.stringify(eventData)}\n\n`;

    this.clients.forEach((controller, clientId) => {
      if (clientId.includes(emailAccountId)) {
        try {
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          // drop dead clients
          this.clients.delete(clientId);
        }
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }
}

// Singleton instance used across API routes
export const voiceEvents = new VoiceEventEmitter();

export function emitVoiceEvent(emailAccountId: string, event: VoiceEvent) {
  voiceEvents.emit(emailAccountId, event);
}

export function emitAgentStep(
  emailAccountId: string,
  step: {
    id: string;
    type: string;
    status: "pending" | "in_progress" | "completed" | "error";
    progress?: number;
    duration?: number;
    emailIds?: string[];
    query?: string;
    confidence?: number;
  },
) {
  emitVoiceEvent(emailAccountId, {
    type: "agent_step",
    data: step,
  });
}

export function emitEmailAction(
  emailAccountId: string,
  action: {
    emailIds: string[];
    action: "selected" | "processed" | "highlighted" | "marked_for_deletion";
    reason?: string;
    metadata?: any;
  },
) {
  emitVoiceEvent(emailAccountId, {
    type: "email_action",
    data: action,
  });
}

export function emitDraftCreated(
  emailAccountId: string,
  draft: {
    content: string;
    recipients?: string[];
    subject?: string;
    threadId?: string;
    replyToMessageId?: string;
  },
) {
  emitVoiceEvent(emailAccountId, {
    type: "draft_created",
    data: draft,
  });
}

export function emitConversationStarted(
  emailAccountId: string,
  data: { sessionId: string; userCommand?: string },
) {
  emitVoiceEvent(emailAccountId, {
    type: "conversation_started",
    data,
  });
}

export function emitConversationEnded(
  emailAccountId: string,
  data: { sessionId: string; duration?: number; actionsPerformed?: number },
) {
  emitVoiceEvent(emailAccountId, {
    type: "conversation_ended",
    data,
  });
}

export function emitUndoAvailable(
  emailAccountId: string,
  undoData: { stepId: string; actionType: string; expiresAt: string; description: string },
) {
  emitVoiceEvent(emailAccountId, {
    type: "undo_available",
    data: undoData,
  });
}

export function emitPlannerUpdated(
  emailAccountId: string,
  plannerData: {
    type: "task_created" | "task_completed" | "task_scheduled" | "task_updated";
    taskId?: string;
    title?: string;
    description?: string;
    scheduledFor?: string;
    relatedEmailIds?: string[];
  },
) {
  emitVoiceEvent(emailAccountId, {
    type: "planner_updated",
    data: plannerData,
  });
}
