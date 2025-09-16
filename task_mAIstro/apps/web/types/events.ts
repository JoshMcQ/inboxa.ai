// Event taxonomy for visual voice-native email OS
// Every action is shown, animated, explainable, undoable

export type EmailEvent = 
  | 'email.searched'
  | 'email.match_found'
  | 'email.opened'
  | 'email.drafted'
  | 'email.sent'
  | 'email.scheduled'
  | 'email.archived'
  | 'email.deleted'
  | 'email.unsubscribed'
  | 'email.labeled'
  | 'email.snoozed'
  | 'email.reply_received';

export type TaskEvent =
  | 'task.created'
  | 'task.completed'
  | 'task.canceled'
  | 'task.rescheduled';

export type CalendarEvent =
  | 'calendar.event_created'
  | 'calendar.event_updated'
  | 'calendar.invite_received';

export type ConnectorEvent =
  | 'connector.connected'
  | 'connector.disconnected'
  | 'connector.error';

export type RuleEvent =
  | 'rule.executed'
  | 'rule.rolled_back';

export type AgentEvent =
  | 'agent.error'
  | 'agent.undo';

export type SystemEvent = EmailEvent | TaskEvent | CalendarEvent | ConnectorEvent | RuleEvent | AgentEvent;

export interface BaseEvent {
  id: string;
  type: SystemEvent;
  timestamp: Date;
  humanString: string; // "Drafting reply to Sarah…"
  undoable: boolean;
  metadata?: Record<string, any>;
}

export interface EmailEventData extends BaseEvent {
  type: EmailEvent;
  emailId?: string;
  threadId?: string;
  sender?: string;
  subject?: string;
  query?: string;
  matchCount?: number;
}

export interface TaskEventData extends BaseEvent {
  type: TaskEvent;
  taskId: string;
  title: string;
  dueDate?: Date;
  linkedEmailId?: string;
  createdBy?: string; // "Rule R-12", "Manual", etc.
}

export interface CalendarEventData extends BaseEvent {
  type: CalendarEvent;
  eventId: string;
  title: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ConnectorEventData extends BaseEvent {
  type: ConnectorEvent;
  connectorId: string;
  connectorName: string;
  errorMessage?: string;
}

export interface RuleEventData extends BaseEvent {
  type: RuleEvent;
  ruleId: string;
  ruleName: string;
  affectedEmails?: string[];
  rollbackReason?: string;
}

export interface AgentEventData extends BaseEvent {
  type: AgentEvent;
  action?: string;
  errorMessage?: string;
  originalEventId?: string; // For undos
}

export type SystemEventData = 
  | EmailEventData 
  | TaskEventData 
  | CalendarEventData 
  | ConnectorEventData 
  | RuleEventData 
  | AgentEventData;

export interface EventStore {
  events: SystemEventData[];
  addEvent: (event: Omit<SystemEventData, 'id' | 'timestamp'>) => void;
  getEvents: (filters?: { type?: SystemEvent; limit?: number }) => SystemEventData[];
  undoEvent: (eventId: string) => Promise<void>;
}