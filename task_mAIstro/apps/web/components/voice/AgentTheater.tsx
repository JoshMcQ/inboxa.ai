"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Mail,
  Edit3,
  Send,
  Archive,
  Trash2,
  Tag,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Eye,
  Undo2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/utils';

interface AgentStep {
  id: string;
  type: 'search' | 'locate' | 'compose' | 'send' | 'archive' | 'delete' | 'schedule' | 'review' | 'undo';
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'cancelled';
  timestamp: Date;
  duration?: number;
  progress?: number;
  data?: {
    query?: string;
    matchCount?: number;
    emailIds?: string[];
    draftContent?: string;
    recipientCount?: number;
    scheduledTime?: Date;
    undoable?: boolean;
    destructive?: boolean;
  };
}

interface AgentTheaterProps {
  steps: AgentStep[];
  isActive: boolean;
  onStepClick?: (step: AgentStep) => void;
  onUndo?: (stepId: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export function AgentTheater({
  steps,
  isActive,
  onStepClick,
  onUndo,
  onPause,
  onResume,
  className
}: AgentTheaterProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest step
  useEffect(() => {
    if (scrollRef.current && steps.length > 0) {
      const latestStep = steps[steps.length - 1];
      if (latestStep.status === 'in_progress' || latestStep.status === 'completed') {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [steps]);

  // Get step icon based on type and status
  const getStepIcon = (step: AgentStep) => {
    const iconClass = "w-4 h-4";
    
    if (step.status === 'in_progress') {
      return <Loader2 className={cn(iconClass, "animate-spin text-blue-500")} />;
    }
    
    if (step.status === 'error') {
      return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    }
    
    if (step.status === 'completed') {
      switch (step.type) {
        case 'search': return <Search className={cn(iconClass, "text-green-500")} />;
        case 'locate': return <Eye className={cn(iconClass, "text-green-500")} />;
        case 'compose': return <Edit3 className={cn(iconClass, "text-green-500")} />;
        case 'send': return <Send className={cn(iconClass, "text-green-500")} />;
        case 'archive': return <Archive className={cn(iconClass, "text-green-500")} />;
        case 'delete': return <Trash2 className={cn(iconClass, "text-green-500")} />;
        case 'schedule': return <Calendar className={cn(iconClass, "text-green-500")} />;
        case 'review': return <CheckCircle className={cn(iconClass, "text-green-500")} />;
        case 'undo': return <Undo2 className={cn(iconClass, "text-green-500")} />;
        default: return <CheckCircle className={cn(iconClass, "text-green-500")} />;
      }
    }
    
    // Pending state
    switch (step.type) {
      case 'search': return <Search className={cn(iconClass, "text-gray-400")} />;
      case 'locate': return <Eye className={cn(iconClass, "text-gray-400")} />;
      case 'compose': return <Edit3 className={cn(iconClass, "text-gray-400")} />;
      case 'send': return <Send className={cn(iconClass, "text-gray-400")} />;
      case 'archive': return <Archive className={cn(iconClass, "text-gray-400")} />;
      case 'delete': return <Trash2 className={cn(iconClass, "text-gray-400")} />;
      case 'schedule': return <Calendar className={cn(iconClass, "text-gray-400")} />;
      case 'review': return <Clock className={cn(iconClass, "text-gray-400")} />;
      case 'undo': return <Undo2 className={cn(iconClass, "text-gray-400")} />;
      default: return <Clock className={cn(iconClass, "text-gray-400")} />;
    }
  };

  // Get step status color
  const getStatusColor = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format step data for display
  const formatStepData = (step: AgentStep) => {
    const { data } = step;
    if (!data) return null;

    const items = [];
    
    if (data.query) items.push(`Query: "${data.query}"`);
    if (data.matchCount !== undefined) items.push(`Found: ${data.matchCount} emails`);
    if (data.recipientCount !== undefined) items.push(`Recipients: ${data.recipientCount}`);
    if (data.emailIds?.length) items.push(`Selected: ${data.emailIds.length} emails`);
    if (data.scheduledTime) items.push(`Scheduled: ${data.scheduledTime.toLocaleString()}`);
    
    return items.length > 0 ? items : null;
  };

  // Handle pause/resume
  const handlePauseResume = () => {
    if (isPaused) {
      onResume?.();
      setIsPaused(false);
    } else {
      onPause?.();
      setIsPaused(true);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            <h3 className="font-semibold text-gray-900">Agent Theater</h3>
            <Badge variant="secondary" className="text-xs">
              {steps.length} steps
            </Badge>
          </div>
          
          {isActive && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePauseResume}
                className="h-8 px-2"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Steps Timeline */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for voice command...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Timeline connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                )}
                
                {/* Step card */}
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                    getStatusColor(step.status),
                    step.data?.destructive && step.status === 'pending' && "border-red-300 border-dashed",
                    expandedStep === step.id && "ring-2 ring-blue-500 ring-opacity-50"
                  )}
                  onClick={() => {
                    setExpandedStep(expandedStep === step.id ? null : step.id);
                    onStepClick?.(step);
                  }}
                >
                  {/* Step icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{step.label}</h4>
                      <div className="flex items-center gap-2">
                        {step.duration && (
                          <span className="text-xs text-gray-500">
                            {step.duration}ms
                          </span>
                        )}
                        {step.data?.undoable && step.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUndo?.(step.id);
                            }}
                          >
                            <Undo2 className="w-3 h-3 mr-1" />
                            Undo
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    
                    {/* Progress bar for in-progress steps */}
                    {step.status === 'in_progress' && step.progress !== undefined && (
                      <Progress value={step.progress} className="mt-2 h-1" />
                    )}
                    
                    {/* Step data */}
                    {expandedStep === step.id && formatStepData(step) && (
                      <div className="mt-2 space-y-1">
                        {formatStepData(step)?.map((item, i) => (
                          <div key={i} className="text-xs text-gray-600 bg-white/50 rounded px-2 py-1">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Destructive warning */}
                    {step.data?.destructive && step.status === 'pending' && (
                      <div className="mt-2 flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        This action cannot be undone
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {isActive && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {steps.filter(s => s.status === 'completed').length} completed
            </span>
            <span>
              {steps.filter(s => s.status === 'pending').length} remaining
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}