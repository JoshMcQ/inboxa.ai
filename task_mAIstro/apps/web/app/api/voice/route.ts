import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

// Configuration for the LangGraph deployment
const LANGGRAPH_URL =
  process.env.LANGGRAPH_URL ||
  process.env.NEXT_PUBLIC_LANGGRAPH_URL ||
  "http://localhost:2024";
const GRAPH_NAME =
  process.env.GRAPH_NAME ||
  process.env.NEXT_PUBLIC_GRAPH_NAME ||
  "task_maistro";

const MOCK_VOICE =
  (process.env.MOCK_VOICE?.toLowerCase() === "true") ||
  process.env.NODE_ENV !== "production";

// Small helper to emit a mock streaming response when LangGraph is offline (useful in dev)
function createMockVoiceStream(message: string) {
  const encoder = new TextEncoder();
  const lines = [
    JSON.stringify({
      messages: [{ role: "ai", content: `Okay. I heard: "${message}".` }],
    }) + "\n",
    JSON.stringify({
      messages: [
        {
          role: "ai",
          content:
            "Your assistant service is offline. This is a mock response so you can demo the UI.",
        },
      ],
    }) + "\n",
  ];
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
}

// small helper to timeout fetches (Node/Edge)
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // @ts-ignore - Edge/Node fetch supports AbortSignal
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Configure the request to the LangGraph agent
    const config = {
      configurable: {
        user_id: userId || session.user.email,
        todo_category: "general",
        task_maistro_role:
          "You are a helpful voice-controlled email assistant. You help users manage their emails, create todos, and draft responses using voice commands.",
      },
    };

    // Health precheck (fast fail with actionable message)
    let healthOk = false;
    try {
      const hc = await fetchWithTimeout(
        `${LANGGRAPH_URL}/health`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
        2500,
      );
      healthOk = hc.ok;
    } catch {
      healthOk = false;
    }
    if (!healthOk) {
      if (MOCK_VOICE) {
        const stream = createMockVoiceStream(message);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain",
            "Transfer-Encoding": "chunked",
            "X-Mock-Voice": "true",
          },
        });
      }
      const err: any = new Error("LangGraph service unavailable");
      err.status = 503;
      err.cause = { code: "ECONNREFUSED" };
      throw err;
    }

    // Send request to LangGraph agent
    const response = await fetchWithTimeout(
      `${LANGGRAPH_URL}/runs/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistant_id: GRAPH_NAME,
          input: {
            messages: [
              {
                role: "human",
                content: message,
              },
            ],
          },
          config,
          stream_mode: "values",
        }),
      },
      15000,
    );

    if (!response.ok) {
      throw new Error(`LangGraph API error: ${response.status}`);
    }

    // Stream the response back to the client
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const stream = new ReadableStream({
      start(controller) {
        function pump(): Promise<void> {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            return pump();
          });
        }
        return pump();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Voice API error:", error);
    const status =
      error?.status ?? (error?.cause?.code === "ECONNREFUSED" ? 503 : 500);
    return NextResponse.json(
      {
        error: "Failed to process voice command",
        detail: error?.message ?? "Unknown error",
        cause: error?.cause?.code,
        langgraph_url: LANGGRAPH_URL,
        graph_name: GRAPH_NAME,
      },
      { status },
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if LangGraph service is available
    const response = await fetch(`${LANGGRAPH_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const isHealthy = response.ok || MOCK_VOICE;
    
    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      langgraph_url: LANGGRAPH_URL,
      graph_name: GRAPH_NAME,
      mock: MOCK_VOICE,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: MOCK_VOICE ? "healthy" : "unhealthy",
        error: "Cannot connect to LangGraph service",
        langgraph_url: LANGGRAPH_URL,
        graph_name: GRAPH_NAME,
        mock: MOCK_VOICE,
        timestamp: new Date().toISOString(),
      },
      { status: MOCK_VOICE ? 200 : 503 },
    );
  }
}