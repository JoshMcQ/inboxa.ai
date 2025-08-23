import Link from "next/link";
import prisma from "@/utils/prisma";
import { getPaginatedThreadTrackers } from "@/app/app-layout/[emailAccountId]/r-zero/fetch-trackers";
import { ThreadTrackerType } from "@prisma/client";
import { MicControl } from "@/components/mic/MicControl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prefixPath } from "@/utils/path";
import {
  MailIcon,
  BotIcon,
  ScissorsIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

/**
 * New Home (Triage) per Sprint 1
 * - Hero with primary Start voice triage
 * - Quick actions chips
 * - Bento (Reply fast, Unsubscribe sweep) with KPI badges
 * - Focus placeholder (full-width)
 */
export default async function HomePage(props: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await props.params;

  // Authorization guard
  await checkUserOwnsEmailAccount({ emailAccountId });

  // Non-blocking KPI aggregation
  let awaitingReply: number | undefined = undefined;
  let newslettersCount: number | undefined = undefined;

  try {
    const [{ count }, newslettersGroup] = await Promise.all([
      getPaginatedThreadTrackers({
        emailAccountId,
        type: ThreadTrackerType.NEEDS_REPLY,
        page: 1,
        timeRange: "all",
      }),
      prisma.newsletter.groupBy({
        where: { emailAccountId },
        by: ["status"],
        _count: true,
      }),
    ]);
    awaitingReply = count;
    newslettersCount = newslettersGroup.reduce(
      (acc, n) => acc + Number(n._count),
      0,
    );
  } catch {
    // Render without KPIs if the aggregation fails
  }

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 py-6 lg:px-6 lg:py-8">
      <Hero emailAccountId={emailAccountId} />

      <QuickActions emailAccountId={emailAccountId} />

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReplyFastCard
          emailAccountId={emailAccountId}
          awaitingReply={awaitingReply}
        />
        <UnsubscribeCard
          emailAccountId={emailAccountId}
          newslettersCount={newslettersCount}
        />
      </div>

      <FocusSection emailAccountId={emailAccountId} />
    </div>
  );
}

/* Hero */

function Hero({ emailAccountId }: { emailAccountId: string }) {
  return (
    <div className="mb-4 rounded-[16px] border border-[var(--border-color)] bg-white p-6 elevation-base">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-gradient">Manage your inbox at the speed of voice</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Summarize, triage, reply, and unsubscribe—your assistant does the busywork.
          </p>
        </div>
        <MicControl>
          <Button variant="primary" size="md">Start voice triage</Button>
        </MicControl>
      </div>
    </div>
  );
}

/* Quick actions */

function QuickActions({ emailAccountId }: { emailAccountId: string }) {
  const items = [
    {
      icon: <SparklesIcon className="h-4 w-4" />,
      label: "Summarize today",
      href: prefixPath(emailAccountId, "/assistant"),
    },
    {
      icon: <BotIcon className="h-4 w-4" />,
      label: "Draft replies",
      href: prefixPath(emailAccountId, "/assistant"),
    },
    {
      icon: <ScissorsIcon className="h-4 w-4" />,
      label: "Unsubscribe top 10",
      href: prefixPath(emailAccountId, "/unsubscribe"),
    },
    {
      icon: <UserIcon className="h-4 w-4" />,
      label: "Brief me next meeting",
      href: prefixPath(emailAccountId, "/assistant"),
    },
  ] as const;

  return (
    <Card className="elevation-base flex flex-wrap items-center gap-2 border border-[var(--border-color)] bg-white px-3 py-2">
      {items.map((i) => (
        <Button asChild key={i.label} variant="ghost" size="sm">
          <Link href={i.href} className="flex items-center gap-2">
            {i.icon}
            {i.label}
          </Link>
        </Button>
      ))}
    </Card>
  );
}

/* Bento: Reply fast */

function ReplyFastCard({
  emailAccountId,
  awaitingReply,
}: {
  emailAccountId: string;
  awaitingReply?: number;
}) {
  return (
    <Card className="elevation-base rounded-[16px] border border-[var(--border-color)] bg-white p-4">
      <div className="mb-3">
        <h3 className="text-[var(--text-foreground)]">Reply in minutes, not hours</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Your assistant drafts first replies in your tone; you approve and send.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button asChild variant="primary" size="md">
            <Link href={prefixPath(emailAccountId, "/r-zero")}>Open reply board</Link>
          </Button>
          <Button asChild variant="secondary" size="md">
            <Link href={prefixPath(emailAccountId, "/assistant")}>Auto‑draft today’s replies</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--border-color)] bg-white">
        <Row
          icon=<MailIcon className="h-4 w-4" />
          title="Awaiting reply"
          description="Open your reply board and knock out responses fast."
          href={prefixPath(emailAccountId, "/r-zero")}
          count={awaitingReply}
        />
        <Divider />
        <Row
          icon=<BotIcon className="h-4 w-4" />
          title="Auto‑draft replies"
          description="Let your assistant write first drafts in your tone."
          href={prefixPath(emailAccountId, "/assistant")}
        />
      </div>
    </Card>
  );
}

/* Bento: Unsubscribe */

function UnsubscribeCard({
  emailAccountId,
  newslettersCount,
}: {
  emailAccountId: string;
  newslettersCount?: number;
}) {
  return (
    <Card className="elevation-base rounded-[16px] border border-[var(--border-color)] bg-white p-4">
      <div className="mb-3">
        <h3 className="text-[var(--text-foreground)]">Unsubscribe & archive in one sweep</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Clean newsletters from the last 90 days with a single click.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button asChild variant="primary" size="md">
            <Link href={prefixPath(emailAccountId, "/unsubscribe")}>Start sweep</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--border-color)] bg-white">
        <Row
          icon=<ScissorsIcon className="h-4 w-4" />
          title="Unsubscribe and archive last 90 days"
          description="One click to clean up recurring senders."
          href={prefixPath(emailAccountId, "/unsubscribe")}
          count={newslettersCount}
        />
      </div>
    </Card>
  );
}

/* Focus placeholder */

function FocusSection({ emailAccountId }: { emailAccountId: string }) {
  return (
    <Card className="elevation-base mt-6 rounded-[16px] border border-[var(--border-color)] bg-white p-4">
      <div className="mb-3">
        <h3 className="text-[var(--text-foreground)]">Today’s Focus</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Your assistant highlights urgent items, follow‑ups due, and calendar conflicts.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button asChild variant="primary" size="md">
            <Link href={prefixPath(emailAccountId, "/assistant")}>Ask the assistant</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-[12px] border border-[var(--border-color)] bg-white p-4 text-sm text-[var(--text-muted)]">
        Tap Ask the assistant and say “Summarize today’s inbox” to get a quick brief and next actions.
      </div>
    </Card>
  );
}

/* Shared row */

function Row({
  icon,
  title,
  description,
  href,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="hover-lift flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <div className="mt-0.5 text-[var(--text-muted)]">{icon}</div>
      <div>
        <div className="font-medium text-[var(--text-foreground)]">
          {title}
          {typeof count === "number" ? ` (${count})` : null}
        </div>
        <div className="text-xs text-[var(--text-muted)]">{description}</div>
      </div>
    </Link>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[var(--border-color)]" />;
}