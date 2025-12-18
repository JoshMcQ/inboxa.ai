"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * useGmailStatus
 * - Fetches the current email account and derives a human-readable "synced X ago" label
 * - Defensive against unknown shapes; falls back gracefully
 * - Optional polling via options.refreshMs (default: 60s)
 */
export function useGmailStatus(options?: { refreshMs?: number; emailAccountId?: string }) {
  const [label, setLabel] = useState<string>("Gmail · syncing…");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMs = options?.refreshMs ?? 60000;
  const emailAccountId = options?.emailAccountId;

  async function fetchStatus() {
    try {
      setLoading(true);
      setError(null);

      if (!emailAccountId) {
        throw new Error("Email account ID is required");
      }

      const res = await fetch("/api/user/email-account", { 
        method: "GET",
        headers: {
          "X-Email-Account-ID": emailAccountId,
        },
      });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      const data = await res.json();

      // Try to infer last sync timestamp from common fields
      const tsCandidate =
        data?.lastSync ??
        data?.lastSyncedAt ??
        data?.syncAt ??
        data?.syncedAt ??
        data?.updatedAt ??
        data?.createdAt;

      const ts = tsCandidate ? new Date(tsCandidate) : null;
      const relative = ts ? `synced ${timeAgo(ts)} ago` : "synced just now";
      setLabel(`Gmail · ${relative}`);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setLabel("Gmail · status unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs, emailAccountId]);

  return useMemo(
    () => ({ label, loading, error, refresh: fetchStatus }),
    [label, loading, error],
  );
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return "just now";
  const intervals: Array<[label: Intl.RelativeTimeFormatUnit, secs: number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""}`;
    }
  }
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}