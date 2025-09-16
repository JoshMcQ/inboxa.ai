"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Undo2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  RotateCcw,
  Trash2,
  Archive,
  Send,
  Calendar
} from 'lucide-react';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface UndoableAction {
  id: string;
  type: 'send' | 'delete' | 'archive' | 'unsubscribe' | 'schedule' | 'bulk_action';
  label: string;
  description: string;
  timestamp: Date;
  expiresAt: Date;
  data: {
    emailIds?: string[];
    recipientCount?: number;
    senderCount?: number;
    originalState?: any;
    canRestore?: boolean;
  };
  status: 'active' | 'expired' | 'undone' | 'confirmed';
}

interface VoiceUndoSystemProps {
  emailAccountId: string;
  recentActions: any[];
  undoTimeoutMs?: number; // Default 30 seconds
  className?: string;
}

export function VoiceUndoSystem({
  emailAccountId,
  recentActions,
  undoTimeoutMs = 30000,
  className
}: VoiceUndoSystemProps) {
  const [undoableActions, setUndoableActions] = useState<UndoableAction[]>([]);
  const [processingUndo, setProcessingUndo] = useState<string | null>(null);

  // Convert recent actions to undoable actions
  useEffect(() => {
    const now = new Date();
    const newUndoables = recentActions
      .filter(action => action.data?.undoable && action.status === 'completed')
      .map((action): UndoableAction => ({
        id: action.id,
        type: action.type as UndoableAction['type'],
        label: `Undo: ${action.label}`,
        description: action.description,
        timestamp: new Date(action.timestamp),
        expiresAt: new Date(Date.now() + undoTimeoutMs),
        data: {
          emailIds: action.data?.emailIds || [],
          recipientCount: action.data?.recipientCount,
          senderCount: action.data?.senderCount,
          originalState: action.data?.originalState,
          canRestore: action.data?.canRestore !== false
        },
        status: 'active'
      }));

    setUndoableActions(prev => {
      // Merge new actions with existing ones, avoiding duplicates
      const existing = prev.filter(a => !newUndoables.some(n => n.id === a.id));
      return [...existing, ...newUndoables];
    });
  }, [recentActions, undoTimeoutMs]);

  // Handle action expiration
  useEffect(() => {
    const interval = setInterval(() => {
      setUndoableActions(prev => prev.map(action => {
        if (action.status === 'active' && new Date() > action.expiresAt) {
          return { ...action, status: 'expired' };
        }
        return action;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-remove expired actions after a delay
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setUndoableActions(prev => 
        prev.filter(action => 
          action.status !== 'expired' && 
          action.status !== 'undone'
        )
      );
    }, 5000);

    return () => clearTimeout(cleanup);
  }, [undoableActions]);

  // Handle undo action
  const handleUndo = useCallback(async (action: UndoableAction) => {
    if (action.status !== 'active') return;

    setProcessingUndo(action.id);

    try {
      const response = await fetch('/api/voice/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          actionType: action.type,
          emailAccountId,
          data: action.data
        })
      });

      if (response.ok) {
        setUndoableActions(prev => prev.map(a => 
          a.id === action.id 
            ? { ...a, status: 'undone' as const }
            : a
        ));

        toast.success(`Undone: ${action.label}`, {
          description: `Successfully reversed ${action.description.toLowerCase()}`,
          duration: 3000
        });

        // Emit undo event for other components
        window.dispatchEvent(new CustomEvent('voice-undo', {
          detail: { action, emailAccountId }
        }));

      } else {
        throw new Error('Failed to undo action');
      }
    } catch (error) {
      console.error('Undo failed:', error);
      toast.error('Failed to undo action', {
        description: 'Please try again or contact support if the issue persists'
      });
    } finally {
      setProcessingUndo(null);
    }
  }, [emailAccountId]);

  // Handle action confirmation (permanent)
  const handleConfirm = useCallback((actionId: string) => {
    setUndoableActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: 'confirmed' as const }
        : action
    ));
    
    toast.success('Action confirmed', {
      description: 'This action is now permanent and cannot be undone'
    });
  }, []);

  // Get action icon
  const getActionIcon = (type: UndoableAction['type'], status: UndoableAction['status']) => {
    const iconClass = "w-4 h-4";
    
    if (status === 'undone') {
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    }
    
    if (status === 'expired') {
      return <Clock className={cn(iconClass, "text-gray-400")} />;
    }
    
    switch (type) {
      case 'send': return <Send className={cn(iconClass, "text-blue-500")} />;
      case 'delete': return <Trash2 className={cn(iconClass, "text-red-500")} />;
      case 'archive': return <Archive className={cn(iconClass, "text-orange-500")} />;
      case 'schedule': return <Calendar className={cn(iconClass, "text-purple-500")} />;
      default: return <RotateCcw className={cn(iconClass, "text-gray-500")} />;
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (action: UndoableAction) => {
    if (action.status !== 'active') return 0;
    const remaining = Math.max(0, action.expiresAt.getTime() - Date.now());
    return remaining / undoTimeoutMs * 100;
  };

  // Filter active actions
  const activeActions = undoableActions.filter(action => 
    action.status === 'active' || action.status === 'undone'
  );

  if (activeActions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {activeActions.map(action => {
        const timeRemaining = getTimeRemaining(action);
        const isProcessing = processingUndo === action.id;
        
        return (
          <Card 
            key={action.id}
            className={cn(
              "p-4 transition-all duration-300",
              action.status === 'undone' && "bg-green-50 border-green-200",
              action.status === 'expired' && "bg-gray-50 border-gray-200 opacity-60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActionIcon(action.type, action.status)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900">
                    {action.label}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {action.description}
                    {action.data.emailIds?.length && (
                      <span className="ml-2 text-blue-600">
                        • {action.data.emailIds.length} emails
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {action.status === 'active' && (
                  <>
                    <div className="text-xs text-gray-500">
                      {Math.ceil(timeRemaining * undoTimeoutMs / 100 / 1000)}s
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleConfirm(action.id)}
                      className="text-xs px-2"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Keep
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUndo(action)}
                      disabled={isProcessing}
                      className="text-xs"
                    >
                      {isProcessing ? (
                        <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Undo2 className="w-3 h-3 mr-1" />
                      )}
                      Undo
                    </Button>
                  </>
                )}
                
                {action.status === 'undone' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Undone
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar for active actions */}
            {action.status === 'active' && (
              <div className="mt-3">
                <Progress 
                  value={100 - timeRemaining} 
                  className="h-1"
                />
              </div>
            )}

            {/* Warning for destructive actions */}
            {action.status === 'active' && 
             (action.type === 'delete' || action.type === 'unsubscribe') && (
              <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="w-3 h-3" />
                This action may be difficult to reverse
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// Hook for managing undo state across the app
export function useVoiceUndo() {
  const [undoHistory, setUndoHistory] = useState<UndoableAction[]>([]);

  const addUndoableAction = useCallback((action: Omit<UndoableAction, 'id' | 'timestamp' | 'expiresAt'>) => {
    const undoableAction: UndoableAction = {
      ...action,
      id: `undo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 30000), // 30 seconds
      status: 'active'
    };
    
    setUndoHistory(prev => [...prev, undoableAction]);
    
    // Show toast notification
    toast(`Action performed: ${action.label}`, {
      description: 'You can undo this action for the next 30 seconds',
      action: {
        label: 'Undo',
        onClick: () => {
          // Trigger undo from toast
          window.dispatchEvent(new CustomEvent('toast-undo', {
            detail: { actionId: undoableAction.id }
          }));
        }
      }
    });
    
    return undoableAction.id;
  }, []);

  const removeUndoableAction = useCallback((actionId: string) => {
    setUndoHistory(prev => prev.filter(action => action.id !== actionId));
  }, []);

  const getUndoableActions = useCallback((filter?: (action: UndoableAction) => boolean) => {
    return filter ? undoHistory.filter(filter) : undoHistory;
  }, [undoHistory]);

  return {
    undoHistory,
    addUndoableAction,
    removeUndoableAction,
    getUndoableActions
  };
}