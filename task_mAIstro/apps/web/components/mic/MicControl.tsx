"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VoiceCommand } from "@/components/VoiceCommand";

/**
 * MicControl
 * - Wrap any element as the trigger (DialogTrigger asChild)
 * - Opens the VoiceCommand capture dialog
 * - Keeps implementation simple so we can later add device picker, live state, etc.
 */
export function MicControl({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <VoiceCommand
            onResponse={() => {
              // Close after a successful voice command round-trip
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}