"use client";

import { useCallback, useEffect, use, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { useSetAtom } from "jotai";
import { List } from "@/components/email-list/EmailList";
import { LoadingContent } from "@/components/LoadingContent";
import type { ThreadsQuery } from "@/app/api/google/threads/validation";
import type { ThreadsResponse } from "@/app/api/google/threads/controller";
import { refetchEmailListAtom } from "@/store/email";
import { ClientOnly } from "@/components/ClientOnly";
import { PermissionsCheck } from "@/app/app-layout/[emailAccountId]/PermissionsCheck";
import { cn } from "@/utils";
import { 
  Bot,
  Clock,
  Mail as MailIcon,
  Search,
  Radio,
  Mic,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceOrchestrator } from "@/components/voice/VoiceOrchestrator";
import { useParams } from "next/navigation";

// No demo data - using real Gmail threads only

export default function Mail(props: {
  searchParams: Promise<{ type?: string; labelId?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const query: ThreadsQuery = {};

  // Handle different query params
  if (searchParams.type === "label" && searchParams.labelId) {
    query.labelId = searchParams.labelId;
  } else if (searchParams.type) {
    query.type = searchParams.type;
  }

  const getKey = (
    pageIndex: number,
    previousPageData: ThreadsResponse | null,
  ) => {
    if (previousPageData && !previousPageData.nextPageToken) return null;
    const queryParams = new URLSearchParams(query as Record<string, string>);
    // Append nextPageToken for subsequent pages
    if (pageIndex > 0 && previousPageData?.nextPageToken) {
      queryParams.set("nextPageToken", previousPageData.nextPageToken);
    }
    return `/api/google/threads?${queryParams.toString()}`;
  };

  const { data, size, setSize, isLoading, error, mutate } =
    useSWRInfinite<ThreadsResponse>(getKey, {
      keepPreviousData: true,
      dedupingInterval: 1_000,
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('SWR Error fetching threads:', error);
        if (error?.status === 401) {
          console.error('Authentication error - user may need to re-login or grant permissions');
        }
      },
      onSuccess: (data) => {
        console.log('SWR Success:', data?.length, 'pages loaded');
      }
    });

  const allThreads = data ? data.flatMap((page) => page.threads) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const showLoadMore = data ? !!data[data.length - 1]?.nextPageToken : false;

  // Debug logging
  console.log('Mail page debug:', {
    dataPages: data?.length || 0,
    allThreadsCount: allThreads.length,
    isLoading,
    error: error?.message || error,
    firstThread: allThreads[0]?.snippet?.slice(0, 50)
  });

  // store `refetch` in the atom so we can refresh the list upon archive via command k
  const refetch = useCallback(
    (options?: { removedThreadIds?: string[] }) => {
      mutate(
        (currentData) => {
          if (!currentData) return currentData;
          if (!options?.removedThreadIds) return currentData;

          return currentData.map((page) => ({
            ...page,
            threads: page.threads.filter(
              (t) => !options?.removedThreadIds?.includes(t.id),
            ),
          }));
        },
        {
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        },
      );
    },
    [mutate],
  );

  // Set up the refetch function in the atom store
  const setRefetchEmailList = useSetAtom(refetchEmailListAtom);
  useEffect(() => {
    setRefetchEmailList({ refetch });
  }, [refetch, setRefetchEmailList]);

  const handleLoadMore = useCallback(() => {
    setSize((size) => size + 1);
  }, [setSize]);

  return (
    <>
      <PermissionsCheck />
      <VoiceNativeMailInterface
        allThreads={allThreads}
        refetch={refetch}
        type={searchParams.type}
        showLoadMore={showLoadMore}
        handleLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        isLoading={isLoading && !data}
        error={error}
      />
    </>
  );
}

interface VoiceNativeMailInterfaceProps {
  allThreads: any[];
  refetch: (options?: { removedThreadIds?: string[] }) => void;
  type?: string;
  showLoadMore?: boolean;
  handleLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLoading: boolean;
  error?: any;
}

function VoiceNativeMailInterface({
  allThreads,
  refetch,
  type,
  showLoadMore,
  handleLoadMore,
  isLoadingMore,
  isLoading,
  error,
}: VoiceNativeMailInterfaceProps) {
  const params = useParams();
  const emailAccountId = params?.emailAccountId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // In real implementation, this would start/stop voice recognition
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Voice-Native Header */}
        <div className="bg-background border-b border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Radio size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Voice Mail</h1>
                <p className="text-muted-foreground">AI-powered email conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={voiceMode ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceMode(!voiceMode)}
                className="gap-2"
              >
                <Mic size={16} />
                Voice Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Bot size={16} />
                AI Summaries
              </Button>
            </div>
          </div>

          {/* Voice Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations or say 'Hey InboxAI'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-4 bg-accent/20 border-2 border-transparent rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:bg-background transition-all"
              />
              <Button
                size="sm"
                variant={isListening ? "default" : "ghost"}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 gap-2",
                  isListening && "bg-red-500 text-white animate-pulse"
                )}
                onClick={handleVoiceSearch}
              >
                <Mic size={16} />
                {isListening ? "Listening..." : "Voice"}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Processing Status */}
        {voiceMode && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">AI Assistant Active</span>
                </div>
                <Badge variant="outline" className="bg-white/50">
                  Processing 3 threads
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={14} />
                <span>Real-time analysis enabled</span>
              </div>
            </div>
          </div>
        )}

        {/* Voice-First Experience Layout */}
        {voiceMode ? (
          <div className="p-6">
            {/* Voice Orchestrator - The complete "Speak & See" experience */}
            <ClientOnly>
              <VoiceOrchestrator
                emailAccountId={emailAccountId}
                isActive={voiceMode}
                className="h-[600px]"
              />
            </ClientOnly>
          </div>
        ) : (
          /* Traditional Email List View */
          <div className="p-6">
            <LoadingContent loading={isLoading} error={error}>
              {allThreads && allThreads.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MailIcon size={24} className="text-primary" />
                    <h2 className="text-xl font-semibold">Your Gmail Conversations</h2>
                    <Badge variant="outline">{allThreads.length} threads</Badge>
                  </div>
                  <List
                    emails={allThreads}
                    refetch={refetch}
                    type={type}
                    showLoadMore={showLoadMore}
                    handleLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
            ) : (
              <Card className="p-12 text-center">
                <MailIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No emails found</h3>
                <p className="text-muted-foreground mb-4">
                  {type ? `No emails found for filter: ${type}` : 'Your inbox appears to be empty or still loading.'}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh Inbox
                </Button>
              </Card>
            )}
            </LoadingContent>
          </div>
        )}
      </div>
    </div>
  );
}
