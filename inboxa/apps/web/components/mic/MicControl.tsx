"use client";

import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

/**
 * MicControl - Now using ElevenLabs Conversational AI Widget
 * - Renders the ElevenLabs widget for natural voice conversation
 * - Passes emailAccountId context for email operations
 */
export function MicControl({ 
  children, 
  emailAccountId,
  userId 
}: { 
  children: React.ReactNode;
  emailAccountId?: string;
  userId?: string;
}) {
  // The ElevenLabs widget replaces the old dialog-based approach
  // It renders as a floating widget that users can interact with
  return (
    <>
      {/* The children element is no longer needed as a trigger since the widget is always available */}
      <ElevenLabsWidget emailAccountId={emailAccountId} userId={userId} />
    </>
  );
}