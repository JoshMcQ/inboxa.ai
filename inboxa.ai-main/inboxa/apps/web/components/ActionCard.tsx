"use client";

import React, { ReactNode } from "react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  disclosure?: {
    isOpen?: boolean;
    onToggle?: () => void;
    content?: ReactNode;
  };
  className?: string;
}

export function ActionCard({
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  disclosure,
  className
}: ActionCardProps) {
  return (
    <div className={cn("action-card", className)}>
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {children && (
          <div>{children}</div>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || "default"}
                className="btn-primary"
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                className="btn-secondary"
              >
                {secondaryAction.label}
              </Button>
            )}
            {disclosure && (
              <Button
                onClick={disclosure.onToggle}
                variant="ghost"
                size="sm"
                className="btn-ghost ml-auto"
              >
                <ChevronDownIcon 
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    disclosure.isOpen && "rotate-180"
                  )} 
                />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Disclosure content */}
      {disclosure?.isOpen && disclosure.content && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {disclosure.content}
        </div>
      )}
    </div>
  );
}

// Specialized Action Card variants for common use cases
export function DraftActionCard({
  from,
  subject,
  preview,
  onSend,
  onSchedule,
  onEdit,
  className
}: {
  from: string;
  subject: string;
  preview: string;
  onSend: () => void;
  onSchedule?: () => void;
  onEdit?: () => void;
  className?: string;
}) {
  return (
    <ActionCard
      title={`Draft Reply to ${from}`}
      description={subject}
      primaryAction={{
        label: "Send",
        onClick: onSend
      }}
      secondaryAction={onSchedule ? {
        label: "Schedule",
        onClick: onSchedule
      } : undefined}
      className={className}
    >
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border-l-4 border-blue-500">
        {preview}
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} className="mt-2">
          Edit Draft
        </Button>
      )}
    </ActionCard>
  );
}

export function SweepActionCard({
  count,
  senderType = "newsletters",
  onRunSweep,
  onReview,
  className
}: {
  count: number;
  senderType?: string;
  onRunSweep: () => void;
  onReview?: () => void;
  className?: string;
}) {
  return (
    <ActionCard
      title={`Unsubscribe & Archive ${count} ${senderType}`}
      description={`Found ${count} ${senderType} to clean up from your inbox`}
      primaryAction={{
        label: "Run Sweep",
        onClick: onRunSweep
      }}
      secondaryAction={onReview ? {
        label: "Review",
        onClick: onReview
      } : undefined}
      className={className}
    />
  );
}

export function SummaryActionCard({
  title = "Today's Focus",
  summary,
  metrics,
  onAsk,
  className
}: {
  title?: string;
  summary?: string;
  metrics?: Array<{ label: string; value: string | number; }>;
  onAsk?: () => void;
  className?: string;
}) {
  return (
    <ActionCard
      title={title}
      primaryAction={onAsk ? {
        label: "Ask Assistant",
        onClick: onAsk
      } : undefined}
      className={className}
    >
      {summary && (
        <p className="text-sm text-gray-600 mb-3">{summary}</p>
      )}
      {metrics && metrics.length > 0 && (
        <div className="flex gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </ActionCard>
  );
}