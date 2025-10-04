import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock environment and server-only first
vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "mock-db-url",
    NEXTAUTH_SECRET: "mock-secret",
    GOOGLE_CLIENT_ID: "mock-client-id",
    GOOGLE_CLIENT_SECRET: "mock-client-secret",
    GOOGLE_ENCRYPT_SECRET: "mock-encrypt-secret",
    GOOGLE_ENCRYPT_SALT: "mock-encrypt-salt",
    GOOGLE_PUBSUB_TOPIC_NAME: "mock-topic",
    INTERNAL_API_KEY: "mock-internal-key",
  },
}));
vi.mock("server-only", () => ({}));

import { summarizeThread } from "@/utils/ai/summaries/summarize-thread";
import type { ThreadSummaryPayload } from "@/app/api/ai/summaries/validation";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import * as redisModule from "@/utils/redis/thread-summaries";
import * as llmModule from "@/utils/llms";

// Mock dependencies
vi.mock("@/utils/redis/thread-summaries");
vi.mock("@/utils/llms");
vi.mock("@/utils/logger", () => ({
  createScopedLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));
vi.mock("@/utils/mail", () => ({
  emailToContent: vi.fn(() => "Mocked email content for performance testing"),
}));

describe("Summaries Performance Tests", () => {
  const mockEmailAccount: EmailAccountWithAI = {
    id: "test-account-id",
    email: "test@example.com",
    user: {
      id: "test-user-id",
      aiModel: "gpt-4o",
      aiProvider: "openai",
      openaiApiKey: "test-key",
    } as any,
  } as any;

  const createMockThread = (id: string): ThreadSummaryPayload => ({
    threadId: id,
    subject: `Test Email Subject ${id}`,
    snippet: `This is a test email snippet for thread ${id}`,
    category: "important",
    isUnread: true,
    isImportant: true,
    latestMessageId: `msg-${id}`,
    messages: [
      {
        id: `msg-${id}`,
        from: "sender@example.com",
        to: "recipient@example.com",
        date: "2024-01-01T10:00:00Z",
        textPlain: `This is the email content for thread ${id} that needs summarizing.`,
        textHtml: `<p>This is the email content for thread ${id} that needs summarizing.</p>`,
      },
    ],
  });

  const mockSummaryResponse = {
    threadHeadline: "Generated Summary",
    threadBullets: ["Key point 1", "Key point 2"],
    latestMessageSummary: "Latest message summary",
    actionItems: ["Action item 1"],
    keyFacts: [{ label: "Priority", value: "High" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup standard mocks
    vi.mocked(redisModule.getThreadSummaryCache).mockResolvedValue(null);
    vi.mocked(redisModule.setThreadSummaryCache).mockResolvedValue();
    vi.mocked(llmModule.chatCompletionObject).mockResolvedValue({
      object: mockSummaryResponse,
    } as any);
  });

  test("should handle batch of 5 threads within reasonable time", async () => {
    const startTime = Date.now();

    const threads = Array.from({ length: 5 }, (_, i) => createMockThread(`thread-${i}`));

    const promises = threads.map((thread) =>
      summarizeThread({
        thread,
        emailAccount: mockEmailAccount,
        since: "2024-01-01T00:00:00Z",
      })
    );

    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within 2 seconds for 5 threads
    expect(duration).toBeLessThan(2000);
    expect(results).toHaveLength(5);
    expect(llmModule.chatCompletionObject).toHaveBeenCalledTimes(5);

    // All results should have valid structure
    results.forEach((result, index) => {
      expect(result.threadId).toBe(`thread-${index}`);
      expect(result.threadHeadline).toBe("Generated Summary");
      expect(result.generatedAt).toBeDefined();
    });
  });

  test("should benefit from caching on subsequent calls", async () => {
    const thread = createMockThread("cached-thread");

    const cachedSummary = {
      threadId: "cached-thread",
      threadHeadline: "Cached Summary",
      threadBullets: ["Cached bullet"],
      actionItems: [],
      keyFacts: [],
      generatedAt: new Date().toISOString(),
    };

    // First call - cache miss
    vi.mocked(redisModule.getThreadSummaryCache).mockResolvedValueOnce(null);

    const startTime1 = Date.now();
    await summarizeThread({
      thread,
      emailAccount: mockEmailAccount,
      since: "2024-01-01T00:00:00Z",
    });
    const duration1 = Date.now() - startTime1;

    // Second call - cache hit
    vi.mocked(redisModule.getThreadSummaryCache).mockResolvedValueOnce(cachedSummary);

    const startTime2 = Date.now();
    const result2 = await summarizeThread({
      thread,
      emailAccount: mockEmailAccount,
      since: "2024-01-01T00:00:00Z",
    });
    const duration2 = Date.now() - startTime2;

    // Cache hit should be significantly faster
    expect(duration2).toBeLessThanOrEqual(duration1);
    expect(result2.threadHeadline).toBe("Cached Summary");

    // LLM should only be called once (for the first request)
    expect(llmModule.chatCompletionObject).toHaveBeenCalledTimes(1);
  });

  test("should handle maximum thread limit efficiently", async () => {
    const startTime = Date.now();

    // Test with 10 threads (our new maximum)
    const threads = Array.from({ length: 10 }, (_, i) => createMockThread(`thread-${i}`));

    const promises = threads.map((thread) =>
      summarizeThread({
        thread,
        emailAccount: mockEmailAccount,
        since: "2024-01-01T00:00:00Z",
      })
    );

    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within 8 seconds for 10 threads (our performance target)
    expect(duration).toBeLessThan(8000);
    expect(results).toHaveLength(10);
    expect(llmModule.chatCompletionObject).toHaveBeenCalledTimes(10);

    // All results should be valid
    results.forEach((result, index) => {
      expect(result.threadId).toBe(`thread-${index}`);
      expect(result.threadHeadline).toBeTruthy();
      expect(result.generatedAt).toBeDefined();
    });
  });

  test("should handle partial failures gracefully without affecting performance", async () => {
    const threads = Array.from({ length: 5 }, (_, i) => createMockThread(`thread-${i}`));

    // Make one thread fail
    let callCount = 0;
    vi.mocked(llmModule.chatCompletionObject).mockImplementation(async () => {
      callCount++;
      if (callCount === 3) {
        throw new Error("LLM service temporarily unavailable");
      }
      return { object: mockSummaryResponse } as any;
    });

    const startTime = Date.now();

    const promises = threads.map((thread) =>
      summarizeThread({
        thread,
        emailAccount: mockEmailAccount,
        since: "2024-01-01T00:00:00Z",
      })
    );

    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should still complete within reasonable time despite one failure
    expect(duration).toBeLessThan(3000);
    expect(results).toHaveLength(5);

    // Check that the failed thread got a fallback summary
    const failedResult = results[2]; // Third call failed
    expect(failedResult.threadHeadline).toBe("Test Email Subject thread-2"); // Fallback to subject
    expect(failedResult.threadBullets).toEqual([]);
    expect(failedResult.actionItems).toEqual([]);
  });

  test("should validate cache TTL and cleanup", async () => {
    const thread = createMockThread("ttl-test");

    // Test with expired cache (>24 hours old)
    const expiredSummary = {
      threadId: "ttl-test",
      threadHeadline: "Old Summary",
      threadBullets: [],
      actionItems: [],
      keyFacts: [],
      generatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
    };

    // Mock the cache to return expired data, which should be rejected
    vi.mocked(redisModule.getThreadSummaryCache).mockImplementation(async () => {
      // Simulate the TTL validation in the cache function
      const ageHours = (Date.now() - new Date(expiredSummary.generatedAt).getTime()) / (1000 * 60 * 60);
      if (ageHours > 24) {
        return null; // Cache expired, return null
      }
      return expiredSummary;
    });

    const result = await summarizeThread({
      thread,
      emailAccount: mockEmailAccount,
      since: "2024-01-01T00:00:00Z",
    });

    // Should generate new summary, not use expired cache
    expect(result.threadHeadline).toBe("Generated Summary");
    expect(llmModule.chatCompletionObject).toHaveBeenCalledTimes(1);
  });

  test("should measure memory efficiency with large batch", async () => {
    const initialMemory = process.memoryUsage();

    // Process a larger batch to test memory efficiency
    const threads = Array.from({ length: 20 }, (_, i) => createMockThread(`memory-test-${i}`));

    // Process in chunks to simulate the API behavior
    const CHUNK_SIZE = 5;
    const results = [];

    for (let i = 0; i < threads.length; i += CHUNK_SIZE) {
      const chunk = threads.slice(i, i + CHUNK_SIZE);
      const chunkResults = await Promise.all(
        chunk.map((thread) =>
          summarizeThread({
            thread,
            emailAccount: mockEmailAccount,
            since: "2024-01-01T00:00:00Z",
          })
        )
      );
      results.push(...chunkResults);
    }

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    // Memory increase should be reasonable (less than 50MB for 20 threads)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    expect(results).toHaveLength(20);
  });
});
