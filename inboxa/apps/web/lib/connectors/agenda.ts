import prisma from "@/utils/prisma";

export async function upsertAgendaItem(i: {
  userId: string;
  source: string;
  sourceId: string;
  title: string;
  subtitle?: string;
  dueAt?: Date | null;
  priority?: number;
  actionNeeded?: boolean;
}) {
  await prisma.agendaItem.upsert({
    where: {
      userId_source_sourceId: {
        userId: i.userId,
        source: i.source,
        sourceId: i.sourceId,
      },
    },
    update: {
      title: i.title,
      subtitle: i.subtitle ?? null,
      dueAt: i.dueAt ?? null,
      priority: i.priority ?? 0,
      actionNeeded: !!i.actionNeeded,
      updatedAt: new Date(),
    },
    create: {
      userId: i.userId,
      source: i.source,
      sourceId: i.sourceId,
      title: i.title,
      subtitle: i.subtitle ?? null,
      dueAt: i.dueAt ?? null,
      priority: i.priority ?? 0,
      actionNeeded: !!i.actionNeeded,
    },
  });
}