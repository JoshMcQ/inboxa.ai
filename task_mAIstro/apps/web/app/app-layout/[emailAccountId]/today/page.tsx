import Link from "next/link";
import prisma from "@/utils/prisma";
import { getPaginatedThreadTrackers } from "@/app/app-layout/[emailAccountId]/r-zero/fetch-trackers";
import { ThreadTrackerType } from "@prisma/client";
import { MicControl } from "@/components/mic/MicControl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prefixPath } from "@/utils/path";
import { Mic } from "@/components/Mic";
import { ActionCard } from "@/components/ActionCard";
import {
  MailIcon,
  BotIcon,
  ScissorsIcon,
  SparklesIcon,
  UserIcon,
  AlertCircleIcon,
  ClockIcon,
  CalendarIcon,
} from "lucide-react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

/**
 * InboxA.AI Today Page - Voice-First Inbox Control
 * 
 * Features per spec:
 * - Greeting + chips (Urgent, Awaiting, Promos, Conflicts)
 * - Primary CTA: Start voice triage
 * - Action Cards: Reply Now, Unsubscribe & archive, Today's Focus
 * - Uses 8-pt spacing scale, 24px section gaps, 16px card gaps
 */
export default async function TodayPage(props: {
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
    <div className="max-w-canvas px-4 py-6 section-padding">
      <TodayHeader emailAccountId={emailAccountId} />
      
      <div className="section-gap">
        <StatusChips 
          urgent={4} 
          awaiting={awaitingReply || 6}
          promos={18}
          conflicts={1}
        />
      </div>
      
      <div className="section-gap">
        <VoiceTriageCard emailAccountId={emailAccountId} />
      </div>
      
      {/* Action Cards Stack */}
      <div className="space-y-6">
        <ReplyNowCard
          emailAccountId={emailAccountId}
          awaitingReply={awaitingReply}
        />
        <UnsubscribeArchiveCard
          emailAccountId={emailAccountId}
          newslettersCount={newslettersCount}
        />
        <TodaysFocusCard emailAccountId={emailAccountId} />
      </div>
    </div>
  );
}

/* Today Header - Greeting */

function TodayHeader({ emailAccountId }: { emailAccountId: string }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-6">
      <h1 className="text-h1 font-bold text-gray-900 mb-2">
        {getGreeting()}, Ready to triage?
      </h1>
      <p className="text-body text-gray-600">
        Open → be briefed → act in seconds. Your calm, voice-first inbox.
      </p>
    </div>
  );
}

/* Status Chips */

function StatusChips({ 
  urgent, 
  awaiting, 
  promos, 
  conflicts 
}: { 
  urgent: number; 
  awaiting: number; 
  promos: number; 
  conflicts: number; 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusChip 
        type="urgent"
        label="Urgent"
        count={urgent}
        icon={<AlertCircleIcon className="w-4 h-4" />}
      />
      <StatusChip 
        type="awaiting"
        label="Awaiting"
        count={awaiting}
        icon={<ClockIcon className="w-4 h-4" />}
      />
      <StatusChip 
        type="promos"
        label="Promos"
        count={promos}
        icon={<MailIcon className="w-4 h-4" />}
      />
      <StatusChip 
        type="conflicts"
        label="Conflicts"
        count={conflicts}
        icon={<CalendarIcon className="w-4 h-4" />}
      />
    </div>
  );
}

function StatusChip({ 
  type, 
  label, 
  count, 
  icon 
}: { 
  type: string; 
  label: string; 
  count: number; 
  icon: React.ReactNode; 
}) {
  const getChipStyles = () => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'awaiting':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'conflicts':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getChipStyles()}`}>
      {icon}
      {label} {count}
    </div>
  );
}

/* Voice Triage Primary CTA */

function VoiceTriageCard({ emailAccountId }: { emailAccountId: string }) {
  return (
    <div className="action-card flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Start voice triage</h3>
        <p className="text-sm text-gray-600">Summarize, reply, and clean up—all by voice</p>
      </div>
      <MicControl emailAccountId={emailAccountId}>
        <Button className="btn-primary flex items-center gap-2">
          <Mic state="idle" size="sm" className="w-5 h-5" />
          Start triage
        </Button>
      </MicControl>
    </div>
  );
}

/* Reply Now Card */

function ReplyNowCard({
  emailAccountId,
  awaitingReply,
}: {
  emailAccountId: string;
  awaitingReply?: number;
}) {
  return (
    <ActionCard
      title="Reply in minutes, not hours"
      description="Open reply board or let AI auto-draft today's responses"
      primaryAction={{
        label: "Open reply board",
        onClick: () => window.location.href = prefixPath(emailAccountId, "/r-zero")
      }}
      secondaryAction={{
        label: "Auto-draft today's",
        onClick: () => window.location.href = prefixPath(emailAccountId, "/assistant")
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <MailIcon className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-medium text-gray-900">
              Awaiting reply ({awaitingReply || 0})
            </div>
            <div className="text-sm text-gray-600">Ready to respond</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <BotIcon className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium text-gray-900">Drafts ready</div>
            <div className="text-sm text-gray-600">AI-generated responses</div>
          </div>
        </div>
      </div>
    </ActionCard>
  );
}

/* Unsubscribe & Archive Card */

function UnsubscribeArchiveCard({
  emailAccountId,
  newslettersCount,
}: {
  emailAccountId: string;
  newslettersCount?: number;
}) {
  return (
    <ActionCard
      title="Unsubscribe & archive"
      description="Clean up promotional emails and newsletters in one sweep"
      primaryAction={{
        label: "Run sweep",
        onClick: () => window.location.href = prefixPath(emailAccountId, "/unsubscribe")
      }}
    >
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-4">
        <ScissorsIcon className="w-5 h-5 text-orange-500" />
        <div>
          <div className="font-medium text-gray-900">
            Review senders ({newslettersCount || 0})
          </div>
          <div className="text-sm text-gray-600">Clean last 90 days</div>
        </div>
      </div>
    </ActionCard>
  );
}

/* Today's Focus Card */

function TodaysFocusCard({ emailAccountId }: { emailAccountId: string }) {
  return (
    <ActionCard
      title="Today's Focus"
      description="Ask the assistant about urgent items, conflicts, and next actions"
      primaryAction={{
        label: "Ask the assistant",
        onClick: () => window.location.href = prefixPath(emailAccountId, "/assistant")
      }}
    >
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900">4</div>
          <div className="text-xs text-gray-500">Urgent</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900">6</div>
          <div className="text-xs text-gray-500">Follow-ups</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900">1</div>
          <div className="text-xs text-gray-500">Conflicts</div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 Hint: Say "Summarize today's inbox" to get started
      </div>
    </ActionCard>
  );
}