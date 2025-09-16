"use client";

import React, { useState, useEffect } from "react";
import { MicIcon, MicOffIcon } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MicState = "idle" | "listening" | "muted";

interface MicProps {
  state?: MicState;
  onToggle?: () => void;
  contextCommands?: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Mic({ 
  state = "idle", 
  onToggle, 
  contextCommands = [
    "Summarize today's inbox",
    "Draft replies to urgent emails", 
    "Start voice triage"
  ],
  className,
  size = "md"
}: MicProps) {
  const [currentCommands, setCurrentCommands] = useState(contextCommands);

  // Listen for mic state changes from other components
  useEffect(() => {
    const handleMicState = (event: CustomEvent) => {
      // This could update the mic state if needed
    };

    window.addEventListener("mic:state", handleMicState as EventListener);
    return () => window.removeEventListener("mic:state", handleMicState as EventListener);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11", // 44px as per spec
    lg: "w-12 h-12"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const getStateClasses = () => {
    switch (state) {
      case "listening":
        return "mic-listening relative";
      case "muted":
        return "mic-muted";
      default:
        return "mic-idle";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {/* Listening halo effect */}
            {state === "listening" && (
              <div className="mic-halo" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "btn-icon rounded-full relative",
                sizeClasses[size],
                getStateClasses(),
                "transition-all duration-200 ease-out",
                className
              )}
              onClick={onToggle}
            >
              {state === "muted" ? (
                <MicOffIcon className={iconSizeClasses[size]} />
              ) : (
                <MicIcon className={iconSizeClasses[size]} />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs p-3 text-sm"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="font-medium">Try saying:</div>
            <ul className="space-y-1">
              {currentCommands.map((command, index) => (
                <li key={index} className="text-gray-600">
                  "{command}"
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}