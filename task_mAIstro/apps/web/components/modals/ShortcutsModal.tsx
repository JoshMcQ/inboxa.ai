"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Row = {
  combo: string;
  description: string;
};

const rows: Row[] = [
  { combo: "/", description: "Focus search" },
  { combo: "c", description: "Compose" },
  { combo: "a", description: "Open Assistant drawer" },
  { combo: "g then i", description: "Go to Inbox" },
  { combo: "⌘/Ctrl + k", description: "Command palette" },
  { combo: "Hold ⌘", description: "Hold to talk (voice)" },
  { combo: "Esc", description: "Dismiss dialogs / blur inputs" },
];

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("shortcuts:open", handler as EventListener);
    return () => window.removeEventListener("shortcuts:open", handler as EventListener);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 gap-2">
          {rows.map((r) => (
            <div
              key={r.combo}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <kbd className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[12px] text-gray-700">
                {r.combo}
              </kbd>
              <span className="ml-3 text-gray-700">{r.description}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShortcutsModal;