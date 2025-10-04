import { redis } from "@/utils/redis";
import type { ThreadSummaryResult } from "@/app/api/ai/summaries/validation";

const PREFIX = "thread-summary";
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

type CacheKeyParams = {
  threadId: string;
  latestMessageId?: string;
};

function buildKey({ threadId, latestMessageId }: CacheKeyParams) {
  return latestMessageId
    ? `${PREFIX}:${threadId}:${latestMessageId}`
    : `${PREFIX}:${threadId}`;
}

export async function getThreadSummaryCache(params: CacheKeyParams) {
  try {
    const key = buildKey(params);
    const cached = await redis.get<string>(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as ThreadSummaryResult;

    // Validate that the cached result has required fields
    if (!parsed.threadId || !parsed.threadHeadline || !parsed.generatedAt) {
      await redis.del?.(key);
      return null;
    }

    // Check if cache is too old (older than 24 hours)
    const generatedAt = new Date(parsed.generatedAt);
    const ageHours = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) {
      await redis.del?.(key);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Cache retrieval error:", error);
    // Attempt to clean up the corrupted key
    try {
      const key = buildKey(params);
      await redis.del?.(key);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

export async function setThreadSummaryCache(
  params: CacheKeyParams,
  summary: ThreadSummaryResult,
) {
  try {
    // Validate summary before caching
    if (!summary.threadId || !summary.threadHeadline) {
      console.warn("Invalid summary object, skipping cache");
      return;
    }

    const key = buildKey(params);
    await redis.set(key, JSON.stringify(summary));
    await redis.expire(key, TTL_SECONDS);
  } catch (error) {
    console.error("Cache setting error:", error);
    // Don't throw - caching failures shouldn't break the flow
  }
}
