"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function SlackConnectButton() {
  const handleSlackConnect = () => {
    // This will be implemented with Nango OAuth
    window.location.href = '/api/nango/slack/auth';
  };

  return (
    <Button size="sm" onClick={handleSlackConnect}>
      <PlusIcon className="h-4 w-4 mr-2" />
      Connect
    </Button>
  );
}