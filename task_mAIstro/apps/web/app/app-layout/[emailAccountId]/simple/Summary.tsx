"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParsedMessage } from "@/utils/types";
import type { ThreadSummaryResult } from "@/app/api/ai/summaries/validation";
import { GmailLabel } from "@/utils/gmail/label";
import { ButtonLoader } from "@/components/Loading";
import { useAccount } from "@/providers/EmailAccountProvider";
import { ViewMoreButton } from "@/app/app-layout/[emailAccountId]/simple/ViewMoreButton";

function isUnread(message: ParsedMessage) {
  return message.labelIds?.includes(GmailLabel.UNREAD) ?? false;
}

function isImportant(message: ParsedMessage) {
  return message.labelIds?.includes(GmailLabel.IMPORTANT) ?? false;
}

function buildSummaryPayload({
  message,
  category,
}: {
  message: ParsedMessage;
  category?: string;
}) {
  return {
    threadId: message.threadId,
    subject: message.headers.subject || message.snippet || "",
    snippet: message.snippet,
    category: category?.toLowerCase(),
    isUnread: isUnread(message),
    isImportant: isImportant(message),
    latestMessageId: message.id,
    messages: [
      {
        id: message.id,
        from: message.headers.from,
        to: message.headers.to,
        date: message.headers.date,
        textPlain: message.textPlain ?? undefined,
        textHtml: message.textHtml ?? undefined,
      },
    ],
  };
}

export function Summary({
  message,
  category,
  onViewMore,
}: {
  message: ParsedMessage;
  category?: string;
  onViewMore?: () => void;
}) {
  const [summary, setSummary] = useState<ThreadSummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { emailAccountId } = useAccount();

  const payload = useMemo(() => buildSummaryPayload({ message, category }), [
    message,
    category,
  ]);

  useEffect(() => {
    if (!emailAccountId) {
      setIsLoading(false);
      setSummary(null);
      setError("Missing email account context");
      return;
    }
    let active = true;

    async function loadSummary() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/summaries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Email-Account-Id": emailAccountId,
          },
          credentials: "include",
          body: JSON.stringify({
            since: message.headers.date || new Date().toISOString(),
            threads: [payload],
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        const firstSummary = (data.summaries as ThreadSummaryResult[])[0];
        if (active) {
          setSummary(firstSummary ?? null);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message || "Unable to summarise email");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [emailAccountId, message.id, message.headers.date, payload]);

  const fallbackText = message.textPlain || message.snippet || "";

  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm text-foreground">
      {isLoading && <ButtonLoader />}

      {!isLoading && summary && (
        <>
          <div className="font-medium text-foreground">{summary.threadHeadline}</div>
          {summary.threadBullets.length > 0 ? (
            <ul className="space-y-1 text-muted-foreground">
              {summary.threadBullets.map((bullet, index) => (
                <li key={index}>• {bullet}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {summary.latestMessageSummary || fallbackText.slice(0, 200)}
            </p>
          )}

          {summary.actionItems.length > 0 && (
            <div className="rounded border border-border bg-white/70 p-2 text-xs text-foreground">
              <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
                Action items
              </div>
              <ul className="space-y-1">
                {summary.actionItems.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!isLoading && !summary && !error && (
        <p className="text-muted-foreground">{fallbackText.slice(0, 200)}</p>
      )}

      {error && !isLoading && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {!!onViewMore && (
        <div className="pt-1">
          <ViewMoreButton onClick={onViewMore} />
        </div>
      )}
    </div>
  );
}
