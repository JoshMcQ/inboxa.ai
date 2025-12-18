"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils";
import type { SystemEventData } from "@/types/events";
import { 
  SearchIcon, 
  CheckCircleIcon, 
  MailIcon, 
  PenToolIcon, 
  SendIcon, 
  ArchiveIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
  UndoIcon,
  AlertTriangleIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const EVENT_ICONS = {
  'email.searched': SearchIcon,
  'email.match_found': CheckCircleIcon,
  'email.opened': MailIcon,
  'email.drafted': PenToolIcon,
  'email.sent': SendIcon,
  'email.scheduled': ClockIcon,
  'email.archived': ArchiveIcon,
  'email.deleted': TrashIcon,
  'email.labeled': TagIcon,
  'task.created': CheckCircleIcon,
  'task.completed': CheckCircleIcon,
  'agent.error': AlertTriangleIcon,
  'agent.undo': UndoIcon,
} as const;

const EVENT_COLORS = {
  'email.searched': 'text-blue-500',
  'email.match_found': 'text-teal-500', // Electric teal for success
  'email.opened': 'text-gray-500',
  'email.drafted': 'text-yellow-500',
  'email.sent': 'text-teal-500',
  'email.scheduled': 'text-indigo-500', // Indigo for in-progress
  'email.archived': 'text-gray-500',
  'email.deleted': 'text-red-500', // Signal red for destructive
  'email.labeled': 'text-purple-500',
  'task.created': 'text-teal-500',
  'task.completed': 'text-teal-500',
  'agent.error': 'text-red-500',
  'agent.undo': 'text-indigo-500',
} as const;

interface ActivityTimelineProps {
  events: SystemEventData[];
  onUndo?: (eventId: string) => void;
  className?: string;
}

export function ActivityTimeline({ events, onUndo, className }: ActivityTimelineProps) {
  const [visibleEvents, setVisibleEvents] = useState<SystemEventData[]>([]);

  useEffect(() => {
    // Animate in new events
    const newEvents = events.slice(visibleEvents.length);
    if (newEvents.length > 0) {
      newEvents.forEach((event, index) => {
        setTimeout(() => {
          setVisibleEvents(prev => [...prev, event]);
        }, index * 150); // Stagger animations
      });
    }
  }, [events.length]);

  return (
    <div className={cn(
      "w-80 bg-sidebar border-r border-sidebar-border flex flex-col",
      className
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="font-semibold text-sidebar-foreground">Activity Timeline</h3>
        <p className="text-sm text-sidebar-foreground/70">Every step shown</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {visibleEvents.length === 0 ? (
          <div className="text-center text-sidebar-foreground/50 py-8">
            <SearchIcon className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Actions will appear here</p>
          </div>
        ) : (
          visibleEvents.map((event, index) => {
            const Icon = EVENT_ICONS[event.type as keyof typeof EVENT_ICONS] || MailIcon;
            const colorClass = EVENT_COLORS[event.type as keyof typeof EVENT_COLORS] || 'text-gray-500';
            
            return (
              <div 
                key={event.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-sidebar-accent/50 animate-fade-in",
                  "border border-sidebar-border/50"
                )}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className={cn("flex-shrink-0 p-1.5 rounded-full", colorClass)}>
                  <Icon className="size-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {event.humanString}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  {event.undoable && onUndo && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-6 px-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      onClick={() => onUndo(event.id)}
                    >
                      <UndoIcon className="size-3 mr-1" />
                      Undo
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Hook for managing events
export function useEventStore() {
  const [events, setEvents] = useState<SystemEventData[]>([]);

  const addEvent = (event: Omit<SystemEventData, 'id' | 'timestamp'>) => {
    const newEvent: SystemEventData = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    } as SystemEventData;
    
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const undoEvent = async (eventId: string) => {
    // Find the event to undo
    const event = events.find(e => e.id === eventId);
    if (!event || !event.undoable) return;

    // Add undo event
    addEvent({
      type: 'agent.undo',
      humanString: `Undoing: ${event.humanString}`,
      undoable: false,
      originalEventId: eventId,
    } as Omit<SystemEventData, 'id' | 'timestamp'>);

    // In a real app, this would call the API to undo the action
    console.log('Undoing event:', event);
  };

  return {
    events,
    addEvent,
    undoEvent,
  };
}