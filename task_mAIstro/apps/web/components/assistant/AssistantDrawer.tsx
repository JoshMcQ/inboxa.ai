"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAccount } from "@/providers/EmailAccountProvider";
import { Chat } from "@/components/assistant-chat/chat";

/**
 * AssistantDrawer
 * - Global, collapsible right-side drawer (420px) that embeds the Assistant Chat engine
 * - Listens for "assistant:toggle" window events to open/close
 * - Accepts optional context via event detail: { context?: "none" | "threadId" | "dayRange"; data?: any }
 * - Keyboard shortcut is handled by useShortcuts() which dispatches "assistant:toggle"
 *
 * Usage:
 *   - Render once at the app shell level (e.g., in SideNavWithTopNav or Global layout)
 *   - Open programmatically: window.dispatchEvent(new CustomEvent("assistant:toggle"))
 */
export function AssistantDrawer() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<{ type?: string; data?: any } | null>(
    null,
  );
  const { emailAccountId } = useAccount();

  const handleToggle = useCallback((e?: CustomEvent) => {
    // Optional payload: { context: "threadId"|"dayRange"|..., data: any }
    const payload: any = e?.detail ?? null;
    if (payload?.context) {
      setContext({ type: payload.context, data: payload.data });
    }
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const listener = (evt: Event) => handleToggle(evt as CustomEvent);
    window.addEventListener("assistant:toggle", listener as EventListener);
    return () => {
      window.removeEventListener("assistant:toggle", listener as EventListener);
    };
  }, [handleToggle]);

  if (!emailAccountId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        // Right-anchored 420px drawer using Radix Dialog
        className="fixed right-0 top-0 z-50 h-screen w-[420px] max-w-[90vw] translate-x-0 rounded-none border-l border-border bg-background p-0 shadow-xl data-[state=closed]:hidden"
        // Remove default centering
        style={{
          inset: "0 0 0 auto",
        }}
      >
        {/* Assistant Chat (full height within drawer) */}
        <div className="flex h-full w-full flex-col">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">
            Assistant
            {context?.type ? (
              <span className="ml-2 text-xs text-muted-foreground">
                ({context.type})
              </span>
            ) : null}
          </div>
          <div className="min-h-0 flex-1">
            <Chat emailAccountId={emailAccountId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}