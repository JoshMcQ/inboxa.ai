import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import SummariesClient from "@/app/app-layout/[emailAccountId]/summaries/SummariesClient";
import * as EmailAccountProvider from "@/providers/EmailAccountProvider";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/providers/EmailAccountProvider", () => ({
  useAccount: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("swr", () => ({
  default: () => ({
    data: {
      threads: [
        {
          id: "thread-1",
          snippet: "Test snippet",
          category: { category: "important" },
          messages: [
            {
              id: "msg-1",
              headers: {
                subject: "Test Subject",
                from: "sender@example.com",
                to: "recipient@example.com",
                date: "2024-01-01T10:00:00Z",
              },
              textPlain: "Test content",
              labelIds: ["UNREAD", "IMPORTANT"],
            },
          ],
        },
        {
          id: "thread-2",
          snippet: "Marketing snippet",
          category: { category: "marketing" },
          messages: [
            {
              id: "msg-2",
              headers: {
                subject: "Marketing Subject",
                from: "marketing@example.com",
                to: "recipient@example.com",
                date: "2024-01-01T11:00:00Z",
              },
              textPlain: "Marketing content",
              labelIds: ["UNREAD"],
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
    mutate: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("SummariesClient", () => {
  const mockEmailAccount = {
    id: "test-account-id",
    email: "test@example.com",
    lastSummaryCheckAt: new Date("2024-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(EmailAccountProvider.useAccount).mockReturnValue({
      emailAccount: mockEmailAccount,
      userEmail: "test@example.com",
    } as any);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        summaries: [
          {
            threadId: "thread-1",
            threadHeadline: "Important Test Summary",
            threadBullets: ["Key point 1", "Key point 2"],
            latestMessageSummary: "Latest message summary",
            actionItems: ["Action 1"],
            keyFacts: [{ label: "Priority", value: "High" }],
            generatedAt: new Date().toISOString(),
          },
        ],
        since: "2024-01-01T00:00:00Z",
      }),
    } as any);
  });

  test("should render initial state correctly", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    expect(screen.getByText("AI Summaries")).toBeTruthy();
    expect(screen.getByText("Voice-ready summaries")).toBeTruthy();
    expect(screen.getByText(/ready/)).toBeTruthy();
  });

  test("should show different view options", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    expect(screen.getByText("Inbox")).toBeTruthy();
    expect(screen.getByText("Important")).toBeTruthy();
    expect(screen.getByText("Unread")).toBeTruthy();
    expect(screen.getByText("All mail")).toBeTruthy();
  });

  test("should show filter options", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    expect(screen.getByText("Unread only")).toBeTruthy();
    expect(screen.getByText("Important only")).toBeTruthy();
    expect(screen.getByText("Exclude marketing")).toBeTruthy();
    expect(screen.getByText("Exclude newsletters")).toBeTruthy();
  });

  test("should toggle unread filter when clicked", async () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const unreadButton = screen.getByText("Unread only");
    fireEvent.click(unreadButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/ai/summaries",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Email-Account-Id": "test-account-id",
          }),
          body: expect.stringContaining('"unreadOnly":true'),
        })
      );
    });
  });

  test("should toggle marketing filter when clicked", async () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const marketingButton = screen.getByText("Exclude marketing");
    fireEvent.click(marketingButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/ai/summaries",
        expect.objectContaining({
          body: expect.stringContaining('"excludeCategories":["marketing"]'),
        })
      );
    });
  });

  test("should handle view change correctly", async () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const importantButton = screen.getByText("Important");
    fireEvent.click(importantButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("type=important"),
        expect.any(Object)
      );
    });
  });

  test("should show regenerate button", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const regenerateButton = screen.getByText("Regenerate");
    expect(regenerateButton).toBeTruthy();
  });

  test("should handle regenerate button click", async () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const regenerateButton = screen.getByText("Regenerate");
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/ai/summaries",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  test("should show customize button and open sheet", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    const customizeButton = screen.getByText("Customize");
    expect(customizeButton).toBeTruthy();

    fireEvent.click(customizeButton);
    expect(screen.getByText("Customize AI summaries")).toBeTruthy();
  });

  test("should handle API errors gracefully", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: async () => "API Error",
    } as any);

    render(<SummariesClient emailAccountId="test-account-id" />);

    const regenerateButton = screen.getByText("Regenerate");
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to generate summaries right now. Please try again."
      );
    });
  });

  test("should handle no matching emails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        summaries: [],
        since: "2024-01-01T00:00:00Z",
      }),
    } as any);

    render(<SummariesClient emailAccountId="test-account-id" />);

    // Click a filter that would exclude all emails
    const marketingButton = screen.getByText("Exclude marketing");
    fireEvent.click(marketingButton);

    const unreadButton = screen.getByText("Unread only");
    fireEvent.click(unreadButton);

    await waitFor(() => {
      expect(screen.getByText(/Adjust filters or choose a different view/)).toBeTruthy();
    });
  });

  test("should show loading skeletons when generating", async () => {
    // Make fetch hang to simulate loading
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    render(<SummariesClient emailAccountId="test-account-id" />);

    const regenerateButton = screen.getByText("Regenerate");
    fireEvent.click(regenerateButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText("Generating…")).toBeTruthy();
    });
  });

  test("should handle voice commands", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    // Simulate voice command event
    const event = new CustomEvent("inboxa:voice-summaries-command", {
      detail: { command: "exclude marketing" },
    });

    window.dispatchEvent(event);

    expect(toast.success).toHaveBeenCalledWith("Updated marketing filter");
  });

  test("should handle ElevenLabs widget click", () => {
    render(<SummariesClient emailAccountId="test-account-id" />);

    // Simulate ElevenLabs click event
    const event = new CustomEvent("inboxa:elevenlabs-click");
    window.dispatchEvent(event);

    // Should open customize sheet
    expect(screen.getByText("Customize AI summaries")).toBeTruthy();
  });

  test("should disable regenerate button when no candidates", () => {
    // Mock empty threads
    vi.doMock("swr", () => ({
      default: () => ({
        data: { threads: [] },
        isLoading: false,
        error: null,
        mutate: vi.fn(),
      }),
    }));

    render(<SummariesClient emailAccountId="test-account-id" />);

    const regenerateButton = screen.getByText("Regenerate");
    expect((regenerateButton as HTMLButtonElement).disabled).toBe(true);
  });
});
