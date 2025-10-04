"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  ArrowUpRight,
  FilterIcon,
  RefreshCw,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingContent } from "@/components/LoadingContent";
import { Progress } from "@/components/ui/progress";
import { useAccount } from "@/providers/EmailAccountProvider";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getGmailUrl } from "@/utils/url";
import type { ThreadSummaryResult } from "@/app/api/ai/summaries/validation";
import type { ThreadsResponse } from "@/app/api/google/threads/controller";
import type { Thread } from "@/components/email-list/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { prefixPath } from "@/utils/path";
import { analyzeEmailIntelligence, shouldExcludeThread } from "@/utils/ai/summaries/intelligent-categorization";

type MailView = "inbox" | "important" | "unread" | "all";

const THREAD_LIMIT = 40;
const MAX_SUMMARY_THREADS = 10;

const VIEW_OPTIONS: { label: string; value: MailView }[] = [
  { label: "Inbox", value: "inbox" },
  { label: "Important", value: "important" },
  { label: "Unread", value: "unread" },
  { label: "All mail", value: "all" },
];

const TIME_RANGE_OPTIONS = [
  { label: "Since last check", value: "auto" },
  { label: "24 hours", value: "24h" },
  { label: "3 days", value: "3d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
] as const;

type TimeRange = typeof TIME_RANGE_OPTIONS[number]["value"];

type SummaryFiltersState = {
  excludeCategories: string[];
  unreadOnly: boolean;
  importantOnly: boolean;
};

const defaultFilters: SummaryFiltersState = {
  excludeCategories: [],
  unreadOnly: false,
  importantOnly: false,
};

const threadsFetcher = async ({
  url,
  emailAccountId,
}: {
  url: string;
  emailAccountId: string;
}) => {
  const response = await fetch(url, {
    headers: {
      "X-Email-Account-Id": emailAccountId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as ThreadsResponse;
};

const buildThreadsUrl = (view: MailView, limit: number) => {
  const params = new URLSearchParams();
  switch (view) {
    case "important":
      params.set("type", "important");
      break;
    case "unread":
      params.set("type", "unread");
      break;
    case "all":
      params.set("type", "all");
      break;
    default:
      params.set("type", "inbox");
  }
  params.set("limit", String(limit));
  return `/api/google/threads?${params.toString()}`;
};

function normalizeCategory(category?: string | null) {
  return category ? category.toLowerCase() : undefined;
}

function isThreadUnread(thread: Thread) {
  return thread.messages?.some((message) =>
    message.labelIds?.includes("UNREAD"),
  );
}

function isThreadImportant(thread: Thread) {
  return thread.messages?.some((message) =>
    message.labelIds?.includes("IMPORTANT"),
  );
}

function deriveSinceIso(
  timeRange: TimeRange,
  lastSummaryCheckAt?: string | Date | null,
) {
  if (timeRange === "auto" && lastSummaryCheckAt) {
    if (lastSummaryCheckAt instanceof Date) return lastSummaryCheckAt.toISOString();
    return lastSummaryCheckAt;
  }

  let days = 3;
  if (timeRange === "24h") days = 1;
  if (timeRange === "7d") days = 7;
  if (timeRange === "30d") days = 30;

  const fallback = new Date();
  fallback.setDate(fallback.getDate() - days);
  return fallback.toISOString();
}

function formatSinceLabel(iso?: string) {
  if (!iso) return "today";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function filterThreadsByState(threads: Thread[], state: SummaryFiltersState) {
  return threads.filter((thread) => {
    // Analyze thread intelligence
    const intelligence = analyzeEmailIntelligence(thread);

    // Apply intelligent filtering
    const shouldExclude = shouldExcludeThread(thread, intelligence, {
      excludeMarketing: state.excludeCategories.includes("marketing"),
      excludeNewsletters: state.excludeCategories.includes("newsletter"),
      excludeLowPriority: false, // We'll add this as a separate filter later
      onlyActionable: false // We'll add this as a separate filter later
    });

    if (shouldExclude) {
      return false;
    }

    // Legacy category filtering for other categories
    const category = normalizeCategory(thread.category?.category);

    if (state.excludeCategories.includes("promotions") && category === "promotions") {
      return false;
    }

    if (state.excludeCategories.includes("social") && category === "social") {
      return false;
    }

    if (state.excludeCategories.includes("updates") && category === "updates") {
      return false;
    }

    if (state.unreadOnly && !isThreadUnread(thread)) {
      return false;
    }

    if (state.importantOnly && !isThreadImportant(thread)) {
      return false;
    }

    return true;
  });
}

function SummaryCard({
  summary,
  userEmail,
}: {
  summary: ThreadSummaryResult;
  userEmail: string;
}) {
  return (
    <Card className="flex h-full flex-col gap-4 border-border/70 bg-card/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {summary.threadHeadline}
          </h3>
          {summary.threadBullets.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {summary.threadBullets.map((bullet, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => window.open(getGmailUrl(summary.threadId, userEmail), "_blank")}
        >
          Open <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {summary.latestMessageSummary && (
        <div className="rounded-md bg-muted/60 p-3 text-sm text-foreground">
          <span className="font-medium text-muted-foreground">Latest:</span>{" "}
          {summary.latestMessageSummary}
        </div>
      )}

      {summary.actionItems.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Action items
          </div>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {summary.actionItems.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.keyFacts.length > 0 && (
        <div className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
          {summary.keyFacts.map((fact, index) => (
            <div
              key={index}
              className="rounded border border-border/70 bg-muted/30 px-3 py-2"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {fact.label}
              </div>
              <div>{fact.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto text-xs text-muted-foreground">
        Generated {formatSinceLabel(summary.generatedAt)}
      </div>
    </Card>
  );
}

type SummariesClientProps = {
  emailAccountId: string;
  initialView?: MailView;
};

export default function SummariesClient({
  emailAccountId,
  initialView = "inbox",
}: SummariesClientProps) {
  const { emailAccount, userEmail } = useAccount();
  const router = useRouter();

  const [view, setView] = useState<MailView>(initialView);
  const [filtersState, setFiltersState] = useState<SummaryFiltersState>(defaultFilters);
  const [timeRange, setTimeRange] = useState<TimeRange>("auto");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [summaries, setSummaries] = useState<ThreadSummaryResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSince, setLastSince] = useState<string | undefined>();
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const sinceIso = useMemo(
    () => deriveSinceIso(timeRange, emailAccount?.lastSummaryCheckAt ?? undefined),
    [timeRange, emailAccount?.lastSummaryCheckAt],
  );

  const fetchKey = emailAccountId
    ? { url: buildThreadsUrl(view, THREAD_LIMIT), emailAccountId }
    : null;

  const { data, isLoading, error, mutate } = useSWR<ThreadsResponse>(
    fetchKey,
    (key) => threadsFetcher(key as { url: string; emailAccountId: string }),
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  const allThreads: Thread[] = useMemo(
    () => (data ? data.threads ?? [] : []),
    [data],
  );

  const filteredThreads = useMemo(
    () => filterThreadsByState(allThreads, filtersState),
    [allThreads, filtersState],
  );

  // Apply view-based filtering first, then custom filters
  const viewFilteredThreads = useMemo(() => {
    let threads = allThreads;

    // Apply view filters
    if (view === "unread") {
      threads = threads.filter(isThreadUnread);
    } else if (view === "important") {
      threads = threads.filter(isThreadImportant);
    }

    // Then apply custom filters
    return filterThreadsByState(threads, filtersState);
  }, [allThreads, view, filtersState]);

  const threadMap = useMemo(() => new Map(allThreads.map((thread) => [thread.id, thread])), [allThreads]);

  const visibleSummaries = useMemo(() => {
    if (!summaries.length) return [];
    return summaries.filter((summary) => {
      const thread = threadMap.get(summary.threadId);
      if (!thread) return true;

      // Apply view filtering first
      let passesViewFilter = true;
      if (view === "unread") {
        passesViewFilter = isThreadUnread(thread);
      } else if (view === "important") {
        passesViewFilter = isThreadImportant(thread);
      }

      // Then apply custom filters
      return passesViewFilter && filterThreadsByState([thread], filtersState).length > 0;
    });
  }, [summaries, threadMap, filtersState, view]);

  const summaryCandidates = useMemo(
    () => viewFilteredThreads.slice(0, MAX_SUMMARY_THREADS),
    [viewFilteredThreads],
  );

  const candidateCount = summaryCandidates.length;
  const marketingExcluded = filtersState.excludeCategories.includes("marketing");
  const newsletterExcluded = filtersState.excludeCategories.includes("newsletter");

  // Calculate exclusion stats for real-time feedback
  const exclusionStats = useMemo(() => {
    if (!allThreads.length) return { marketing: 0, newsletters: 0, lowPriority: 0 };

    let marketingCount = 0;
    let newsletterCount = 0;
    let lowPriorityCount = 0;

    allThreads.forEach(thread => {
      const intelligence = analyzeEmailIntelligence(thread);
      if (intelligence.isMarketing) marketingCount++;
      if (intelligence.isNewsletter) newsletterCount++;
      if (intelligence.priorityScore < 40) lowPriorityCount++;
    });

    return { marketing: marketingCount, newsletters: newsletterCount, lowPriority: lowPriorityCount };
  }, [allThreads]);

  const handleGenerateSummaries = useCallback(async () => {
    if (!candidateCount) {
      toast.info("No emails match the current filters yet.");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: candidateCount });

    try {
      const payloadThreads = summaryCandidates.map((thread) => {
        const messages = (thread.messages ?? []).slice(-5).map((message) => ({
          id: message.id,
          from: message.headers.from,
          to: message.headers.to,
          date: message.headers.date,
          textPlain: message.textPlain ?? undefined,
          textHtml: message.textHtml ?? undefined,
        }));

        const latestMessage = messages[messages.length - 1];

        return {
          threadId: thread.id,
          subject:
            thread.messages?.[thread.messages.length - 1]?.headers.subject ||
            thread.snippet ||
            "",
          snippet: thread.snippet ?? undefined,
          category: normalizeCategory(thread.category?.category),
          isUnread: isThreadUnread(thread),
          isImportant: isThreadImportant(thread),
          latestMessageId: latestMessage?.id,
          messages,
        };
      });

      const includeCategory = (() => {
        if (view === "important") return ["important"];
        return undefined;
      })();

      const response = await fetch("/api/ai/summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Email-Account-Id": emailAccountId,
        },
        credentials: "include",
        body: JSON.stringify({
          since: sinceIso,
          filters: {
            includeCategories: includeCategory,
            excludeCategories: filtersState.excludeCategories.length
              ? filtersState.excludeCategories
              : undefined,
            unreadOnly: filtersState.unreadOnly || undefined,
            importantOnly: filtersState.importantOnly || undefined,
          },
          threads: payloadThreads,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = await response.json();
      const normalized = (payload.summaries as ThreadSummaryResult[]).map((summary) => ({
        ...summary,
        threadBullets: summary.threadBullets ?? [],
        actionItems: summary.actionItems ?? [],
      }));
      setSummaries(normalized);
      setLastSince(payload.since ?? sinceIso);
      setGenerationProgress({ current: normalized.length, total: candidateCount });
      mutate();
    } catch (error) {
      console.error("Error generating summaries:", error);
      toast.error("Unable to generate summaries right now. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  }, [candidateCount, summaryCandidates, filtersState, emailAccountId, sinceIso, view, mutate]);

  useEffect(() => {
    if (!autoTriggered && !isGenerating && summaries.length === 0 && candidateCount > 0) {
      setAutoTriggered(true);
      void handleGenerateSummaries();
    }
  }, [autoTriggered, candidateCount, handleGenerateSummaries, isGenerating, summaries.length, viewFilteredThreads]);

  const handleToggleFilter = useCallback(
    (key: keyof SummaryFiltersState, value?: string) => {
      setFiltersState((current) => {
        if (key === "excludeCategories" && value) {
          const exists = current.excludeCategories.includes(value);
          return {
            ...current,
            excludeCategories: exists
              ? current.excludeCategories.filter((item) => item !== value)
              : [...current.excludeCategories, value],
          };
        }

        return {
          ...current,
          [key]:
            key === "unreadOnly" || key === "importantOnly"
              ? !current[key]
              : current[key],
        };
      });

      // Clear summaries and trigger regeneration after filter change
      setSummaries([]);
      setAutoTriggered(false);
    },
    [],
  );

  const handleViewChange = useCallback((nextView: MailView) => {
    setView(nextView);
    setSummaries([]);
    setAutoTriggered(false);
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setSummaries([]);
    setAutoTriggered(false);
  }, []);

  const handleVoiceCommand = useCallback(
    (command: string) => {
      const normalized = command.toLowerCase();
      let applied = false;

      if (normalized.includes("unread")) {
        handleToggleFilter("unreadOnly");
        toast.success("Toggled unread filter via voice");
        applied = true;
      }

      if (normalized.includes("important")) {
        handleToggleFilter("importantOnly");
        toast.success("Toggled important filter via voice");
        applied = true;
      }

      if (normalized.includes("exclude marketing")) {
        handleToggleFilter("excludeCategories", "marketing");
        toast.success("Updated marketing filter");
        applied = true;
      }

      if (normalized.includes("include marketing")) {
        setFiltersState((current) => ({
          ...current,
          excludeCategories: current.excludeCategories.filter((item) => item !== "marketing"),
        }));
        toast.success("Included marketing senders");
        applied = true;
      }

      if (normalized.includes("exclude newsletters")) {
        handleToggleFilter("excludeCategories", "newsletter");
        toast.success("Updated newsletter filter");
        applied = true;
      }

      if (normalized.includes("include newsletters")) {
        setFiltersState((current) => ({
          ...current,
          excludeCategories: current.excludeCategories.filter((item) => item !== "newsletter"),
        }));
        toast.success("Included newsletters");
        applied = true;
      }

      if (normalized.includes("last 24")) {
        handleTimeRangeChange("24h");
        applied = true;
      } else if (normalized.includes("last 7")) {
        handleTimeRangeChange("7d");
        applied = true;
      } else if (normalized.includes("last 30")) {
        handleTimeRangeChange("30d");
        applied = true;
      }

      if (normalized.includes("show summaries") || normalized.includes("open summaries")) {
        router.push(prefixPath(emailAccountId, "/summaries"));
        applied = true;
      }

      if (normalized.includes("customize summaries")) {
        setCustomizeOpen(true);
        applied = true;
      }

      if (normalized.includes("regenerate")) {
        void handleGenerateSummaries();
        applied = true;
      }

      if (!applied) {
        console.debug("Unhandled voice command", command);
      }
    },
    [emailAccountId, handleGenerateSummaries, handleTimeRangeChange, handleToggleFilter, router],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ command?: string }>).detail;
      if (detail?.command) {
        handleVoiceCommand(detail.command);
      }
    };

    window.addEventListener("inboxa:voice-summaries-command", handler);
    return () => window.removeEventListener("inboxa:voice-summaries-command", handler);
  }, [handleVoiceCommand]);

  useEffect(() => {
    const handleWidgetTap = () => setCustomizeOpen(true);
    window.addEventListener("inboxa:elevenlabs-click", handleWidgetTap);
    return () => window.removeEventListener("inboxa:elevenlabs-click", handleWidgetTap);
  }, []);

  const sinceLabel = formatSinceLabel(lastSince ?? sinceIso);

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary
        fallback={
          <Card className="mx-auto mt-8 max-w-md p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Unable to load AI summaries
            </h3>
            <p className="text-sm text-red-700 mb-4">
              There was an error loading the summaries interface. Please refresh the page or try again later.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Refresh page
            </Button>
          </Card>
        }
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
          <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SparklesIcon className="h-4 w-4 text-primary" />
                Voice-ready summaries
              </div>
              <h1 className="text-3xl font-semibold text-foreground">AI Summaries</h1>
              <p className="text-muted-foreground">
                Condensed context for the threads that matter most, ready for follow-up.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(prefixPath(emailAccountId, "/mail"))}
              >
                Back to Mail
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <a href="#customize" onClick={(event) => {
                  event.preventDefault();
                  setCustomizeOpen(true);
                }}>
                  <Settings2Icon className="h-4 w-4" />
                  Customize
                </a>
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleGenerateSummaries}
                disabled={isGenerating || !candidateCount}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" /> Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>

          <Card className="flex flex-wrap items-center gap-2 border-border/60 bg-card/70 p-4 text-sm text-foreground">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {candidateCount} ready
            </Badge>
            <span className="text-muted-foreground">since {sinceLabel}</span>
            {isGenerating && generationProgress && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">
                  Generating {generationProgress.current}/{generationProgress.total}
                </span>
                <Progress
                  value={(generationProgress.current / generationProgress.total) * 100}
                  className="w-24 h-2"
                />
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={view === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <FilterIcon className="h-4 w-4" />
            <Button
              variant={filtersState.unreadOnly ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleFilter("unreadOnly")}
            >
              Unread only
            </Button>
            <Button
              variant={filtersState.importantOnly ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleFilter("importantOnly")}
            >
              Important only
            </Button>
            <Button
              variant={marketingExcluded ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleFilter("excludeCategories", "marketing")}
              className="gap-2"
            >
              Exclude marketing
              {exclusionStats.marketing > 0 && (
                <Badge variant="secondary" className="text-xs">
                  -{exclusionStats.marketing}
                </Badge>
              )}
            </Button>
            <Button
              variant={newsletterExcluded ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToggleFilter("excludeCategories", "newsletter")}
              className="gap-2"
            >
              Exclude newsletters
              {exclusionStats.newsletters > 0 && (
                <Badge variant="secondary" className="text-xs">
                  -{exclusionStats.newsletters}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Settings2Icon className="h-4 w-4" />
                  More filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleToggleFilter("excludeCategories", "promotions")}>
                  Toggle promotions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleFilter("excludeCategories", "social")}>
                  Toggle social
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleFilter("excludeCategories", "updates")}>
                  Toggle updates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCustomizeOpen(true)}>
                  Open advanced
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <LoadingContent loading={isLoading} error={error}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isGenerating && visibleSummaries.length === 0 &&
              Array.from({ length: Math.max(1, candidateCount) }).map((_, index) => (
                <Card key={index} className="space-y-4 border-border/40 bg-card/50 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}

            {visibleSummaries.map((summary) => (
              <SummaryCard key={summary.threadId} summary={summary} userEmail={userEmail} />
            ))}
          </div>

          {!isGenerating && visibleSummaries.length === 0 && (
            <Card className="flex flex-col items-center justify-center gap-3 border-dashed border-border/60 bg-card/40 p-10 text-center">
              <SparklesIcon className="h-6 w-6 text-primary" />
              <div className="text-sm text-muted-foreground">
                Adjust filters or choose a different view to prepare new summaries.
              </div>
            </Card>
          )}
        </LoadingContent>
        </div>

      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent side="right" className="flex w-full max-w-md flex-col gap-6 bg-background">
          <SheetHeader>
            <SheetTitle>Customize AI summaries</SheetTitle>
            <SheetDescription>
              Update filters, timeframe, and categories. Voice commands will reflect these defaults.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Time range</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={timeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Category filters</h3>
              <div className="mt-3 space-y-2">
                {["marketing", "newsletter", "promotions", "social", "updates"].map((category) => (
                  <div key={category} className="flex items-center gap-3 rounded border border-border/60 bg-card/50 px-3 py-2">
                    <Checkbox
                      id={`custom-${category}`}
                      checked={!filtersState.excludeCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltersState((current) => ({
                            ...current,
                            excludeCategories: current.excludeCategories.filter((item) => item !== category),
                          }));
                        } else {
                          setFiltersState((current) => ({
                            ...current,
                            excludeCategories: current.excludeCategories.includes(category)
                              ? current.excludeCategories
                              : [...current.excludeCategories, category],
                          }));
                        }
                        setSummaries([]);
                        setAutoTriggered(false);
                      }}
                    />
                    <Label htmlFor={`custom-${category}`} className="text-sm capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filtersState.unreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("unreadOnly")}
                >
                  Toggle unread
                </Button>
                <Button
                  variant={filtersState.importantOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("importantOnly")}
                >
                  Toggle important
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltersState(defaultFilters);
                    setTimeRange("auto");
                    setSummaries([]);
                    setAutoTriggered(false);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Button onClick={() => {
              setCustomizeOpen(false);
              void handleGenerateSummaries();
            }}>
              Apply & regenerate
            </Button>
            <Button variant="ghost" onClick={() => setCustomizeOpen(false)}>
              Close
            </Button>
          </div>
          </SheetContent>
        </Sheet>
      </ErrorBoundary>
    </div>
  );
}
