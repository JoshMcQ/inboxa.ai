"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Archive,
  Mail,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/utils';

interface EmailHighlightState {
  emailId: string;
  type: 'match' | 'selected' | 'pending_delete' | 'pending_archive' | 'pending_reply' | 'processing';
  confidence?: number;
  reason?: string;
  animation?: 'flash' | 'pulse' | 'glow' | 'shake';
  temporary?: boolean;
}

interface EmailHighlighterProps {
  emailId: string;
  highlightState?: EmailHighlightState;
  children: React.ReactNode;
  onEmailAction?: (emailId: string, action: string) => void;
  className?: string;
}

export function EmailHighlighter({
  emailId,
  highlightState,
  children,
  onEmailAction,
  className
}: EmailHighlighterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show highlight when state changes
  useEffect(() => {
    if (highlightState) {
      setIsVisible(true);
      
      // Auto-hide temporary highlights
      if (highlightState.temporary) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
      
      // Show confirmation for destructive actions
      if (highlightState.type === 'pending_delete' || 
          (highlightState.type === 'pending_archive' && highlightState.reason?.includes('unsubscribe'))) {
        setShowConfirmation(true);
      }
    } else {
      setIsVisible(false);
      setShowConfirmation(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [highlightState]);

  // Scroll into view when highlighted
  useEffect(() => {
    if (highlightState && elementRef.current) {
      elementRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [highlightState]);

  if (!highlightState || !isVisible) {
    return <div className={className}>{children}</div>;
  }

  // Get highlight styling based on state
  const getHighlightStyles = () => {
    const baseClasses = "relative transition-all duration-500 ease-in-out";
    
    switch (highlightState.type) {
      case 'match':
        return cn(
          baseClasses,
          "ring-2 ring-green-400 ring-opacity-75 bg-green-50 border-green-200",
          highlightState.animation === 'flash' && "animate-pulse",
          highlightState.animation === 'glow' && "shadow-lg shadow-green-200"
        );
      
      case 'selected':
        return cn(
          baseClasses,
          "ring-2 ring-blue-400 ring-opacity-75 bg-blue-50 border-blue-200",
          highlightState.animation === 'pulse' && "animate-pulse"
        );
      
      case 'pending_delete':
        return cn(
          baseClasses,
          "ring-2 ring-red-500 ring-opacity-75 bg-red-50 border-red-300 border-dashed",
          highlightState.animation === 'shake' && "animate-bounce"
        );
      
      case 'pending_archive':
        return cn(
          baseClasses,
          "ring-2 ring-orange-400 ring-opacity-75 bg-orange-50 border-orange-200 border-dashed"
        );
      
      case 'pending_reply':
        return cn(
          baseClasses,
          "ring-2 ring-purple-400 ring-opacity-75 bg-purple-50 border-purple-200"
        );
      
      case 'processing':
        return cn(
          baseClasses,
          "ring-2 ring-gray-400 ring-opacity-75 bg-gray-50 border-gray-200 animate-pulse"
        );
      
      default:
        return baseClasses;
    }
  };

  // Get highlight badge
  const getHighlightBadge = () => {
    const badgeClasses = "absolute -top-2 -right-2 z-10 flex items-center gap-1 text-xs";
    
    switch (highlightState.type) {
      case 'match':
        return (
          <Badge className={cn(badgeClasses, "bg-green-500 text-white")}>
            <CheckCircle className="w-3 h-3" />
            Match {highlightState.confidence && `(${Math.round(highlightState.confidence * 100)}%)`}
          </Badge>
        );
      
      case 'selected':
        return (
          <Badge className={cn(badgeClasses, "bg-blue-500 text-white")}>
            <Eye className="w-3 h-3" />
            Selected
          </Badge>
        );
      
      case 'pending_delete':
        return (
          <Badge className={cn(badgeClasses, "bg-red-500 text-white animate-pulse")}>
            <Trash2 className="w-3 h-3" />
            Delete?
          </Badge>
        );
      
      case 'pending_archive':
        return (
          <Badge className={cn(badgeClasses, "bg-orange-500 text-white")}>
            <Archive className="w-3 h-3" />
            Archive?
          </Badge>
        );
      
      case 'pending_reply':
        return (
          <Badge className={cn(badgeClasses, "bg-purple-500 text-white")}>
            <Mail className="w-3 h-3" />
            Reply
          </Badge>
        );
      
      case 'processing':
        return (
          <Badge className={cn(badgeClasses, "bg-gray-500 text-white")}>
            <Zap className="w-3 h-3 animate-spin" />
            Processing
          </Badge>
        );
      
      default:
        return null;
    }
  };

  // Get confirmation overlay
  const getConfirmationOverlay = () => {
    if (!showConfirmation) return null;

    const isDestructive = highlightState.type === 'pending_delete' || 
                          highlightState.reason?.includes('unsubscribe');
    
    return (
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded">
        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className={cn(
              "w-5 h-5",
              isDestructive ? "text-red-500" : "text-orange-500"
            )} />
            <div className="text-sm font-medium">
              {isDestructive ? "Confirm Deletion" : "Confirm Action"}
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            {highlightState.reason || "This action will be performed on this email."}
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setIsVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={isDestructive ? "destructive" : "default"}
              onClick={() => {
                onEmailAction?.(emailId, highlightState.type.replace('pending_', ''));
                setShowConfirmation(false);
                setIsVisible(false);
              }}
            >
              {isDestructive ? "Delete" : "Confirm"}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div 
      ref={elementRef}
      className={cn(getHighlightStyles(), className)}
    >
      {children}
      {getHighlightBadge()}
      {getConfirmationOverlay()}
      
      {/* Reason tooltip */}
      {highlightState.reason && !showConfirmation && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-90 z-10">
          {highlightState.reason}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Hook for managing multiple email highlights
export function useEmailHighlights() {
  const [highlights, setHighlights] = useState<Map<string, EmailHighlightState>>(new Map());

  const addHighlight = (emailId: string, state: Omit<EmailHighlightState, 'emailId'>) => {
    setHighlights(prev => new Map(prev).set(emailId, { emailId, ...state }));
  };

  const removeHighlight = (emailId: string) => {
    setHighlights(prev => {
      const next = new Map(prev);
      next.delete(emailId);
      return next;
    });
  };

  const clearAllHighlights = () => {
    setHighlights(new Map());
  };

  const updateHighlight = (emailId: string, updates: Partial<EmailHighlightState>) => {
    setHighlights(prev => {
      const current = prev.get(emailId);
      if (!current) return prev;
      
      const next = new Map(prev);
      next.set(emailId, { ...current, ...updates });
      return next;
    });
  };

  const getHighlight = (emailId: string): EmailHighlightState | undefined => {
    return highlights.get(emailId);
  };

  // Batch operations for performance
  const setMultipleHighlights = (emailIds: string[], state: Omit<EmailHighlightState, 'emailId'>) => {
    setHighlights(prev => {
      const next = new Map(prev);
      emailIds.forEach(emailId => {
        next.set(emailId, { emailId, ...state });
      });
      return next;
    });
  };

  return {
    highlights,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    updateHighlight,
    getHighlight,
    setMultipleHighlights,
  };
}
