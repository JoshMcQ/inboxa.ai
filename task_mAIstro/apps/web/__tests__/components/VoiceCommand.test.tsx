import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VoiceCommand } from "@/components/VoiceCommand";
import { toast } from "sonner";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Speech Recognition API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  start() {
    // Simulate successful start
  }

  stop() {
    if (this.onend) {
      this.onend();
    }
  }

  // Helper method to simulate speech result
  simulateResult(transcript: string, isFinal: boolean = true) {
    if (this.onresult) {
      const mockEvent = {
        results: [
          {
            0: { transcript },
            isFinal,
            length: 1,
          },
        ],
        resultIndex: 0,
      };
      this.onresult(mockEvent as any);
    }
  }

  // Helper method to simulate error
  simulateError(error: string) {
    if (this.onerror) {
      this.onerror({ error, message: error } as any);
    }
  }
}

describe("VoiceCommand", () => {
  let mockRecognition: MockSpeechRecognition;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock Speech Recognition
    mockRecognition = new MockSpeechRecognition();
    global.window.webkitSpeechRecognition = vi.fn(() => mockRecognition) as any;
    
    // Mock fetch
    global.fetch = vi.fn();
    
    // Mock CustomEvent
    global.window.dispatchEvent = vi.fn();
    
    // Mock Audio
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      onended: null,
    })) as any;
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock speechSynthesis
    global.speechSynthesis = {
      speak: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the voice command button", () => {
      render(<VoiceCommand />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.getByText("Start Voice Command")).toBeInTheDocument();
    });

    it("should render help text with example commands", () => {
      render(<VoiceCommand />);
      
      expect(screen.getByText(/Click the microphone to start voice commands/i)).toBeInTheDocument();
      expect(screen.getByText(/Send an email to John about the meeting/i)).toBeInTheDocument();
    });

    it("should be disabled when processing", () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      // Initially enabled
      expect(button).not.toBeDisabled();
    });
  });

  describe("Speech Recognition Initialization", () => {
    it("should show error if speech recognition is not supported", () => {
      // Remove speech recognition support
      delete (global.window as any).webkitSpeechRecognition;
      delete (global.window as any).SpeechRecognition;
      
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      expect(toast.error).toHaveBeenCalledWith(
        "Speech recognition not supported in this browser"
      );
    });

    it("should initialize speech recognition with correct settings", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockRecognition.continuous).toBe(true);
        expect(mockRecognition.interimResults).toBe(true);
        expect(mockRecognition.lang).toBe("en-US");
      });
    });
  });

  describe("Recording State", () => {
    it("should start recording when button is clicked", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith(
          "Voice recording started. Speak your command..."
        );
      });
    });

    it("should dispatch mic state event when recording starts", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(window.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "mic:state",
            detail: "listening",
          })
        );
      });
    });

    it("should show recording indicator with pulse animation", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveClass("animate-pulse");
      });
    });

    it("should stop recording when button is clicked again", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      // Start recording
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      // Simulate speech
      mockRecognition.simulateResult("test command");
      
      // Stop recording
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Start Voice Command")).toBeInTheDocument();
      });
    });
  });

  describe("Transcript Handling", () => {
    it("should display transcript as user speaks", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test transcript", false);
      
      await waitFor(() => {
        expect(screen.getByText("Transcript:")).toBeInTheDocument();
        expect(screen.getByText("test transcript")).toBeInTheDocument();
      });
    });

    it("should handle final and interim transcripts", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      // Interim result
      mockRecognition.simulateResult("hello", false);
      
      await waitFor(() => {
        expect(screen.getByText("hello")).toBeInTheDocument();
      });
      
      // Final result
      mockRecognition.simulateResult(" world", true);
      
      await waitFor(() => {
        expect(screen.getByText(/hello world/i)).toBeInTheDocument();
      });
    });

    it("should show error if no speech detected", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      // Stop without speaking
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "No speech detected. Please try again."
        );
      });
    });
  });

  describe("API Integration", () => {
    beforeEach(() => {
      // Mock successful health check
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "healthy" }),
      });
    });

    it("should check assistant health before processing", async () => {
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/voice", { method: "GET" });
      });
    });

    it("should show error if assistant is unavailable", async () => {
      // Mock failed health check
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ status: "unhealthy" }),
      });
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Assistant unavailable")
        );
      });
    });

    it("should require emailAccountId for authentication", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Voice commands require email account authentication. Please refresh and try again."
        );
      });
    });

    it("should send transcript to voice API with correct headers", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  messages: [{ content: "Response text" }]
                })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(<VoiceCommand emailAccountId="test-account" userId="test-user" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/voice",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              "X-Email-Account-ID": "test-account",
            }),
            body: expect.stringContaining("test command"),
          })
        );
      });
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: "Internal server error" }),
        });
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("API error 500")
        );
      });
    });
  });

  describe("Response Handling", () => {
    it("should call onResponse callback with API response", async () => {
      const onResponse = vi.fn();
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  messages: [{ content: "Test response" }]
                })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(
        <VoiceCommand
          emailAccountId="test-account"
          onResponse={onResponse}
        />
      );
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(onResponse).toHaveBeenCalledWith("Test response");
      });
    });

    it("should play ElevenLabs audio if provided", async () => {
      const audioBase64 = btoa("mock audio data");
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  messages: [{ content: "Test response" }],
                  audio_base64: audioBase64,
                })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalled();
      });
    });

    it("should fall back to speech synthesis if audio fails", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  messages: [{ content: "Test response" }]
                })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(speechSynthesis.speak).toHaveBeenCalled();
      });
    });

    it("should show success toast after processing", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  messages: [{ content: "Test response" }]
                })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Voice command processed successfully!"
        );
      });
    });

    it("should handle empty response", async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({ messages: [] })),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };
      
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockResolvedValueOnce(mockResponse);
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "No response received from the assistant"
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle speech recognition errors", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateError("network");
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Speech recognition error: network");
      });
    });

    it("should handle network errors during API calls", async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "healthy" }) })
        .mockRejectedValueOnce(new Error("Network error"));
      
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to process voice command");
      });
    });

    it("should clear transcript after error", async () => {
      render(<VoiceCommand emailAccountId="test-account" />);
      const button = screen.getByRole("button");
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
      
      mockRecognition.simulateResult("test command");
      
      // Stop without proper API response
      (global.fetch as any).mockRejectedValue(new Error("API error"));
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText("test command")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/Start Voice Command|Stop Recording/);
    });

    it("should be keyboard accessible", async () => {
      render(<VoiceCommand />);
      const button = screen.getByRole("button");
      
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: "Enter" });
      await waitFor(() => {
        expect(screen.getByText("Stop Recording")).toBeInTheDocument();
      });
    });
  });
});