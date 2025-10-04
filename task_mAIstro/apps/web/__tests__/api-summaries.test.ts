import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock environment first
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

// Mock server-only
vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/ai/summaries/route";
import * as middleware from "@/utils/middleware";
import * as userUtils from "@/utils/user/get";
import * as summaryUtils from "@/utils/ai/summaries/summarize-thread";
import prisma from "@/utils/prisma";

// Mock dependencies
vi.mock("@/utils/middleware");
vi.mock("@/utils/user/get");
vi.mock("@/utils/ai/summaries/summarize-thread");
vi.mock("@/utils/prisma", () => ({
  default: {
    emailAccount: {
      update: vi.fn(),
    },
  },
}));

describe("AI Summaries API", () => {
  const mockEmailAccount = {
    id: "test-account-id",
    email: "test@example.com",
    user: {
      id: "test-user-id",
      aiModel: "gpt-4o",
      aiProvider: "openai",
      openaiApiKey: "test-key",
    },
  };

  const mockRequest = {
    auth: {
      emailAccountId: "test-account-id",
    },
    json: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/ai/summaries", () => {
    test("should process summaries request successfully", async () => {
      const requestBody = {
        since: "2024-01-01T00:00:00Z",
        threads: [
          {
            threadId: "thread-1",
            subject: "Test Subject",
            snippet: "Test snippet",
            category: "important",
            isUnread: true,
            isImportant: true,
            latestMessageId: "msg-1",
            messages: [
              {
                id: "msg-1",
                from: "sender@example.com",
                to: "recipient@example.com",
                date: "2024-01-01T10:00:00Z",
                textPlain: "Test email content",
              },
            ],
          },
        ],
        filters: {
          excludeCategories: ["marketing"],
          unreadOnly: true,
        },
      };

      const mockSummary = {
        threadId: "thread-1",
        threadHeadline: "Test Summary",
        threadBullets: ["Bullet point 1"],
        latestMessageSummary: "Latest message summary",
        actionItems: ["Action item 1"],
        keyFacts: [{ label: "Priority", value: "High" }],
        generatedAt: new Date().toISOString(),
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockResolvedValue(mockSummary);
      vi.mocked(prisma.emailAccount.update).mockResolvedValue({} as any);

      // Mock the middleware to call our handler
      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(1);
      expect(responseData.summaries[0]).toEqual(mockSummary);
      expect(responseData.appliedFilters).toEqual(requestBody.filters);
      expect(responseData.since).toBe(requestBody.since);
    });

    test("should handle email account not found", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Test Subject",
            messages: [
              {
                id: "msg-1",
                from: "sender@example.com",
              },
            ],
          },
        ],
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(null);

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe("Email account not found");
    });

    test("should filter threads by excludeCategories", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Marketing Email",
            category: "marketing",
            messages: [{ id: "msg-1" }],
          },
          {
            threadId: "thread-2",
            subject: "Important Email",
            category: "important",
            messages: [{ id: "msg-2" }],
          },
        ],
        filters: {
          excludeCategories: ["marketing"],
        },
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockResolvedValue({
        threadId: "thread-2",
        threadHeadline: "Important Summary",
        threadBullets: [],
        actionItems: [],
        keyFacts: [],
        generatedAt: new Date().toISOString(),
      });

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(1);
      expect(responseData.summaries[0].threadId).toBe("thread-2");
      expect(summaryUtils.summarizeThread).toHaveBeenCalledTimes(1);
    });

    test("should filter threads by unreadOnly", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Read Email",
            isUnread: false,
            messages: [{ id: "msg-1" }],
          },
          {
            threadId: "thread-2",
            subject: "Unread Email",
            isUnread: true,
            messages: [{ id: "msg-2" }],
          },
        ],
        filters: {
          unreadOnly: true,
        },
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockResolvedValue({
        threadId: "thread-2",
        threadHeadline: "Unread Summary",
        threadBullets: [],
        actionItems: [],
        keyFacts: [],
        generatedAt: new Date().toISOString(),
      });

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(1);
      expect(responseData.summaries[0].threadId).toBe("thread-2");
    });

    test("should filter threads by importantOnly", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Regular Email",
            isImportant: false,
            messages: [{ id: "msg-1" }],
          },
          {
            threadId: "thread-2",
            subject: "Important Email",
            isImportant: true,
            messages: [{ id: "msg-2" }],
          },
        ],
        filters: {
          importantOnly: true,
        },
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockResolvedValue({
        threadId: "thread-2",
        threadHeadline: "Important Summary",
        threadBullets: [],
        actionItems: [],
        keyFacts: [],
        generatedAt: new Date().toISOString(),
      });

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(1);
      expect(responseData.summaries[0].threadId).toBe("thread-2");
    });

    test("should limit threads to maximum of 10", async () => {
      const threads = Array.from({ length: 15 }, (_, i) => ({
        threadId: `thread-${i}`,
        subject: `Subject ${i}`,
        messages: [{ id: `msg-${i}` }],
      }));

      const requestBody = { threads };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockImplementation(async ({ thread }) => ({
        threadId: thread.threadId,
        threadHeadline: `Summary ${thread.threadId}`,
        threadBullets: [],
        actionItems: [],
        keyFacts: [],
        generatedAt: new Date().toISOString(),
      }));

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(10);
      expect(summaryUtils.summarizeThread).toHaveBeenCalledTimes(10);
    });

    test("should handle individual thread summarization failures gracefully", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Good Thread",
            messages: [{ id: "msg-1" }],
          },
          {
            threadId: "thread-2",
            subject: "Bad Thread",
            messages: [{ id: "msg-2" }],
          },
        ],
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);

      vi.mocked(summaryUtils.summarizeThread)
        .mockResolvedValueOnce({
          threadId: "thread-1",
          threadHeadline: "Good Summary",
          threadBullets: [],
          actionItems: [],
          keyFacts: [],
          generatedAt: new Date().toISOString(),
        })
        .mockRejectedValueOnce(new Error("Summarization failed"));

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      const response = await POST(mockRequest as any, {} as any);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.summaries).toHaveLength(2);
      expect(responseData.summaries[0].threadHeadline).toBe("Good Summary");
      expect(responseData.summaries[1].latestMessageSummary).toBe("Summary temporarily unavailable");
    });

    test("should update emailAccount with lastSummaryCheckAt", async () => {
      const requestBody = {
        threads: [
          {
            threadId: "thread-1",
            subject: "Test Subject",
            messages: [{ id: "msg-1" }],
          },
        ],
        filters: { unreadOnly: true },
      };

      mockRequest.json.mockResolvedValue(requestBody);
      vi.mocked(userUtils.getEmailAccountWithAi).mockResolvedValue(mockEmailAccount as any);
      vi.mocked(summaryUtils.summarizeThread).mockResolvedValue({
        threadId: "thread-1",
        threadHeadline: "Test Summary",
        threadBullets: [],
        actionItems: [],
        keyFacts: [],
        generatedAt: new Date().toISOString(),
      });

      vi.mocked(middleware.withEmailAccount).mockImplementation((handler) => {
        return handler as any;
      });

      await POST(mockRequest as any, {} as any);

      expect(prisma.emailAccount.update).toHaveBeenCalledWith({
        where: { id: "test-account-id" },
        data: {
          lastSummaryCheckAt: expect.any(Date),
          summaryPreferences: { unreadOnly: true },
        },
      });
    });
  });
});
