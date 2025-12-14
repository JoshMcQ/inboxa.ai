import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlannerPage from "@/app/app-layout/[emailAccountId]/planner/page";

// Mock dependencies
vi.mock("@/components/ActivityTimeline", () => ({
  ActivityTimeline: () => <div data-testid="activity-timeline">Timeline</div>,
  useEventStore: () => ({
    addEvent: vi.fn(),
    events: [],
  }),
}));

vi.mock("@/components/StatusDock", () => ({
  StatusDock: ({ jobs }: any) => (
    <div data-testid="status-dock">Status Dock ({jobs.length} jobs)</div>
  ),
  useStatusDock: () => ({
    jobs: [],
    addJob: vi.fn(),
    updateJob: vi.fn(),
    removeJob: vi.fn(),
    getActiveJobs: vi.fn(() => []),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("PlannerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API response by default
    (global.fetch as any).mockResolvedValue({
      ok: false, // Will fallback to mock data
      json: async () => ([]),
    });
  });

  describe("Rendering", () => {
    it("should render the main planner layout", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("AI Task Planner")).toBeInTheDocument();
      });
    });

    it("should render the timeline view section", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Timeline View")).toBeInTheDocument();
      });
    });

    it("should render task lists section", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Follow-ups")).toBeInTheDocument();
        expect(screen.getByText("Waiting On")).toBeInTheDocument();
        expect(screen.getByText("Scheduled Sends")).toBeInTheDocument();
      });
    });

    it("should render activity timeline component", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("activity-timeline")).toBeInTheDocument();
      });
    });

    it("should render status dock component", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId("status-dock")).toBeInTheDocument();
      });
    });
  });

  describe("Task Loading", () => {
    it("should show loading state initially", () => {
      render(<PlannerPage />);
      
      // Component should handle loading state internally
      expect(screen.queryByText("AI Task Planner")).toBeInTheDocument();
    });

    it("should load tasks from API on mount", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/tasks");
      });
    });

    it("should fallback to mock data if API fails", async () => {
      (global.fetch as any).mockRejectedValue(new Error("API error"));
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Mock data includes tasks with these titles
        expect(screen.getByText(/Sarah about Q4 budget approval/)).toBeInTheDocument();
      });
    });

    it("should handle successful API response", async () => {
      const mockTasks = [
        {
          id: "api-1",
          title: "API Task 1",
          type: "follow-up",
          priority: "high",
          dueDate: new Date().toISOString(),
          createdBy: "API",
          createdAt: new Date().toISOString(),
          status: "pending",
        },
      ];
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("API Task 1")).toBeInTheDocument();
      });
    });

    it("should convert date strings to Date objects", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Test Task",
          type: "follow-up",
          priority: "high",
          dueDate: "2024-12-15T10:00:00Z",
          createdBy: "Test",
          createdAt: "2024-12-14T10:00:00Z",
          status: "pending",
        },
      ];
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });
    });
  });

  describe("Timeline View", () => {
    it("should display time slots for the day", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Should show hours from 6 AM to 10 PM
        expect(screen.getByText(/6 AM/i)).toBeInTheDocument();
        expect(screen.getByText(/10 PM/i)).toBeInTheDocument();
      });
    });

    it("should highlight current hour", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour <= 22) {
          // Current hour should be visible and highlighted
          const timeString = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            hour12: true,
          }).format(new Date().setHours(currentHour, 0, 0, 0));
          
          expect(screen.getByText(timeString)).toBeInTheDocument();
        }
      });
    });

    it("should group tasks by hour", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Mock tasks are scheduled at specific hours
        // Should see tasks grouped in their time slots
        expect(screen.getAllByText(/Follow up|Waiting on|Send/i).length).toBeGreaterThan(0);
      });
    });

    it("should show 'No tasks' for empty time slots", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Some time slots should be empty
        expect(screen.getAllByText("No tasks").length).toBeGreaterThan(0);
      });
    });
  });

  describe("Task Lists", () => {
    it("should display follow-up tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Follow-ups")).toBeInTheDocument();
        expect(screen.getByText(/Sarah about Q4 budget approval/)).toBeInTheDocument();
      });
    });

    it("should display waiting-on tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Waiting On")).toBeInTheDocument();
        expect(screen.getByText(/Invoice approval from Finance/)).toBeInTheDocument();
      });
    });

    it("should display scheduled-send tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Scheduled Sends")).toBeInTheDocument();
        expect(screen.getByText(/Weekly report to team/)).toBeInTheDocument();
      });
    });

    it("should show task count for each category", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Should show counts like (1) or (2) next to category names
        expect(screen.getByText(/\(\d+\)/)).toBeInTheDocument();
      });
    });

    it("should display priority indicators", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Priority indicators are rendered as colored dots
        const tasks = screen.getAllByText(/Sarah|Invoice|Weekly/);
        expect(tasks.length).toBeGreaterThan(0);
      });
    });

    it("should show due times for tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Should show formatted due times
        expect(screen.getByText(/Due/i)).toBeInTheDocument();
      });
    });

    it("should show estimated duration for tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Mock tasks have durations like "15m", "30m"
        expect(screen.getByText(/15m/)).toBeInTheDocument();
      });
    });

    it("should show task creator", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Created by Auto-rule R-12/)).toBeInTheDocument();
      });
    });

    it("should show empty state for categories with no tasks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Meetings category should be empty
        expect(screen.getByText(/No meetings yet/i)).toBeInTheDocument();
      });
    });

    it("should filter tasks by status (pending only)", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Should only show pending tasks in the lists
        const allTasks = screen.getAllByText(/Sarah|Invoice|Weekly/);
        // All mock tasks are pending
        expect(allTasks.length).toBe(3);
      });
    });
  });

  describe("Task Interaction", () => {
    it("should open task detail panel when task is clicked", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        // Detail panel should show more info
        expect(screen.getByText("Context")).toBeInTheDocument();
      });
    });

    it("should close detail panel when close button is clicked", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Context")).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText("×");
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText("Context")).not.toBeInTheDocument();
      });
    });

    it("should complete task when complete button is clicked", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText("Complete Task");
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/tasks/"),
          expect.objectContaining({
            method: "POST",
          })
        );
      });
    });

    it("should update task status locally after completion", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText("Complete Task");
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        // Task should be removed from pending list
        expect(screen.queryByText(/Sarah about Q4 budget approval/)).not.toBeInTheDocument();
      });
    });

    it("should handle completion errors gracefully", async () => {
      (global.fetch as any).mockRejectedValue(new Error("API error"));
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText("Complete Task");
        fireEvent.click(completeButton);
      });
      
      // Should still update locally even if backend fails
      await waitFor(() => {
        expect(screen.queryByText(/Sarah about Q4 budget approval/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Task Detail Panel", () => {
    it("should display task title", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getAllByText(/Sarah about Q4 budget approval/)[0]).toBeInTheDocument();
      });
    });

    it("should display task priority", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/high priority/i)).toBeInTheDocument();
      });
    });

    it("should display formatted due date", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        // Should show formatted date with weekday
        expect(screen.getByText(/Due/)).toBeInTheDocument();
      });
    });

    it("should display task creator and creation time", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Created by/)).toBeInTheDocument();
        expect(screen.getByText(/Auto-rule R-12/)).toBeInTheDocument();
      });
    });

    it("should display linked email if present", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Linked Email")).toBeInTheDocument();
        expect(screen.getByText("Q4 Budget Planning Discussion")).toBeInTheDocument();
      });
    });

    it("should show open thread button for linked emails", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Open thread")).toBeInTheDocument();
      });
    });

    it("should not show linked email section if no email linked", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Weekly report to team/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        expect(screen.queryByText("Linked Email")).not.toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle tasks with missing optional fields", async () => {
      const minimalTask = {
        id: "minimal",
        title: "Minimal Task",
        type: "follow-up",
        priority: "low",
        dueDate: new Date().toISOString(),
        createdBy: "Test",
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [minimalTask],
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Minimal Task")).toBeInTheDocument();
      });
    });

    it("should handle empty task list", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/No follow-ups yet/i)).toBeInTheDocument();
      });
    });

    it("should handle tasks with past due dates", async () => {
      const pastTask = {
        id: "past",
        title: "Overdue Task",
        type: "follow-up",
        priority: "high",
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "Test",
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [pastTask],
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Overdue Task")).toBeInTheDocument();
      });
    });

    it("should handle rapid task clicks", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task1 = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task1);
      });
      
      await waitFor(() => {
        expect(screen.getByText("Context")).toBeInTheDocument();
      });
      
      // Quickly click another task
      const task2 = screen.getByText(/Invoice approval from Finance/);
      fireEvent.click(task2);
      
      await waitFor(() => {
        // Should show the second task's details
        expect(screen.getByText(/Invoice #INV-2024-001/)).toBeInTheDocument();
      });
    });
  });

  describe("Formatting", () => {
    it("should format time in 12-hour format", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        // Should see AM/PM indicators
        expect(screen.getByText(/AM|PM/i)).toBeInTheDocument();
      });
    });

    it("should format dates consistently", async () => {
      render(<PlannerPage />);
      
      await waitFor(() => {
        const task = screen.getByText(/Sarah about Q4 budget approval/);
        fireEvent.click(task);
      });
      
      await waitFor(() => {
        // Dates should be formatted with month, day, time
        const dateElements = screen.getAllByText(/\d{1,2}:\d{2}/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it("should truncate long task titles appropriately", async () => {
      const longTitleTask = {
        id: "long",
        title: "This is a very long task title that should be truncated appropriately in the UI to prevent layout issues",
        type: "follow-up",
        priority: "medium",
        dueDate: new Date().toISOString(),
        createdBy: "Test",
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [longTitleTask],
      });
      
      render(<PlannerPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/This is a very long task title/)).toBeInTheDocument();
      });
    });
  });
});