"use client";

import type { ParsedMessage } from "@/utils/types";
import { ViewMoreButton } from "@/app/app-layout/[emailAccountId]/simple/ViewMoreButton";

export function Summary({
  message,
  category,
  onViewMore,
}: {
  message: ParsedMessage;
  category?: string;
  onViewMore?: () => void;
}) {
  // AI Summaries feature has been removed - show simple preview
  const fallbackText = message.textPlain || message.snippet || "";

  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm text-foreground">
      <p className="text-muted-foreground">{fallbackText.slice(0, 200)}</p>

      {!!onViewMore && (
        <div className="pt-1">
          <ViewMoreButton onClick={onViewMore} />
        </div>
      )}
    </div>
  );
}
