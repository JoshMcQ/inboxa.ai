export type AgendaUpsert = {
  userId: string;
  source: 'gmail' | 'calendar';
  sourceId: string;
  title: string;
  subtitle?: string;
  dueAt?: Date | null;
  priority?: number;
  actionNeeded?: boolean;
};

export interface Connector {
  upsertAgendaItem(input: AgendaUpsert): Promise<void>;
}