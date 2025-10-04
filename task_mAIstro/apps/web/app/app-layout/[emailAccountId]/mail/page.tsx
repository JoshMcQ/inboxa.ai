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
  RefreshCw,
  SparklesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { prefixPath } from "@/utils/path";

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
  const [showSummaries, setShowSummaries] = useState(false);
  const [summaries, setSummaries] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  const generateAISummaries = async () => {
    if (!allThreads || allThreads.length === 0) return;

    setSummarizing(true);
    try {
      // Take the first 5 threads for summarization to avoid too many API calls
      const threadsToSummarize = allThreads.slice(0, 5);
      const summaryPromises = threadsToSummarize.map(async (thread) => {
        const response = await fetch('/api/ai/summarise', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            textPlain: thread.snippet || '',
            textHtml: thread.snippet || '',
          }),
        });

        if (response.ok) {
          return await response.text();
        }
        return `Summary unavailable for: ${thread.snippet?.slice(0, 50)}...`;
      });

      const results = await Promise.all(summaryPromises);
      setSummaries(results);
      setShowSummaries(true);
    } catch (error) {
      console.error('Error generating summaries:', error);
    } finally {
      setSummarizing(false);
    }
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
                <h1 className="text-2xl font-bold text-foreground">Mail</h1>
                <p className="text-muted-foreground">AI-powered email conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link
                  href={prefixPath(emailAccountId, "/summaries")}
                  className="flex items-center gap-2"
                >
                  <SparklesIcon size={16} />
                  AI Summaries
                </Link>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-accent/20 border-2 border-transparent rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>

        {/* AI Summaries Panel */}
        {showSummaries && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">AI Email Summaries</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummaries(false)}
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaries.map((summary, index) => (
                <Card key={index} className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Email {index + 1}
                  </div>
                  <div className="text-sm text-foreground">
                    {summary}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Email List View */}
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
      </div>
    </div>
  );
}
