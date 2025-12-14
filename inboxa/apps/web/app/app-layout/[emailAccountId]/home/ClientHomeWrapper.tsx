"use client";

import { ActivityTimeline, useEventStore } from "@/components/ActivityTimeline";
import { StatusDock, useStatusDock } from "@/components/StatusDock";

export function ClientHomeWrapper() {
  const { events } = useEventStore();
  const { jobs } = useStatusDock();

  return (
    <>
      {/* Activity Timeline could be shown here if needed */}
      {/* Status Dock for any background operations */}
      <StatusDock jobs={jobs} />
    </>
  );
}