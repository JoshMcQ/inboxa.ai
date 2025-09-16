"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  AlertCircle,
  Mail,
  User,
  Target,
  Zap,
  Brain,
  ArrowRight,
  Timer
} from 'lucide-react';
import { cn } from '@/utils';
import { VoiceIntent } from './VoiceIntentParser';

// Task types that can be automatically created from voice commands
export type AutoTaskType = 
  | 'follow-up'
  | 'waiting-on'
  | 'scheduled-send'
  | 'meeting'
  | 'reminder'
  | 'review';

export interface VoiceCreatedTask {
  id: string;
  title: string;
  type: AutoTaskType;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  linkedEmailId?: string;
  linkedThreadSubject?: string;
  createdBy: string;
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedDuration?: number;
  voiceCommand: string;
  confidence: number;
  autoScheduled: boolean;
}

interface VoicePlannerIntegrationProps {
  emailAccountId: string;
  voiceIntent?: VoiceIntent;
  selectedEmailIds?: string[];
  onTaskCreated?: (task: VoiceCreatedTask) => void;
  onTaskScheduled?: (task: VoiceCreatedTask, scheduledTime: Date) => void;
  className?: string;
}

export function VoicePlannerIntegration({
  emailAccountId,
  voiceIntent,
  selectedEmailIds = [],
  onTaskCreated,
  onTaskScheduled,
  className
}: VoicePlannerIntegrationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<VoiceCreatedTask[]>([]);
  const [suggestedTasks, setSuggestedTasks] = useState<VoiceCreatedTask[]>([]);
  const [creationProgress, setCreationProgress] = useState(0);

  // Auto-create tasks when voice intent changes
  useEffect(() => {
    if (!voiceIntent) return;

    // Only process intents that could create tasks
    const taskCreatingIntents = ['schedule', 'reminder', 'follow_up', 'waiting', 'meeting'];
    if (!taskCreatingIntents.some(intent => voiceIntent.type.includes(intent))) return;

    createTasksFromIntent(voiceIntent);
  }, [voiceIntent]);

  // Create tasks from voice intent
  const createTasksFromIntent = useCallback(async (intent: VoiceIntent) => {
    setIsCreating(true);
    setCreationProgress(0);

    try {
      // Analyze intent and generate tasks
      const tasks = await analyzeIntentForTasks(intent);
      
      setCreationProgress(50);
      
      // Auto-schedule tasks based on context
      const scheduledTasks = await scheduleTasksIntelligently(tasks);
      
      setCreationProgress(80);
      
      // Save tasks
      for (const task of scheduledTasks) {
        await createTask(task);
        onTaskCreated?.(task);
        
        if (task.autoScheduled) {
          onTaskScheduled?.(task, task.dueDate);
        }
      }

      setCreatedTasks(prev => [...prev, ...scheduledTasks]);
      setCreationProgress(100);

      // Clear progress after delay
      setTimeout(() => {
        setCreationProgress(0);
        setIsCreating(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to create tasks from voice intent:', error);
      setIsCreating(false);
      setCreationProgress(0);
    }
  }, [onTaskCreated, onTaskScheduled]);

  // Analyze voice intent to determine what tasks to create
  const analyzeIntentForTasks = useCallback(async (intent: VoiceIntent): Promise<VoiceCreatedTask[]> => {
    const tasks: VoiceCreatedTask[] = [];
    const baseTask = {
      id: `voice-task-${Date.now()}`,
      createdBy: 'Voice Command',
      createdAt: new Date(),
      status: 'pending' as const,
      voiceCommand: intent.rawTranscript,
      confidence: intent.confidence === 'high' ? 0.9 : intent.confidence === 'medium' ? 0.7 : 0.5,
      autoScheduled: true
    };

    // Parse different intent types
    switch (intent.type) {
      case 'schedule':
        if (intent.parameters.content) {
          tasks.push({
            ...baseTask,
            title: `Schedule: ${intent.parameters.content}`,
            type: 'scheduled-send',
            priority: 'medium',
            dueDate: parseScheduleTime(intent.parameters.scheduleTime),
            estimatedDuration: 15
          });
        }
        break;

      case 'search':
        // Create follow-up task for search results
        if (intent.parameters.query && intent.confidence === 'high') {
          tasks.push({
            ...baseTask,
            title: `Follow up on: ${intent.parameters.query}`,
            type: 'follow-up',
            priority: 'medium',
            dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            estimatedDuration: 10
          });
        }
        break;

      case 'reply':
      case 'compose':
        // Create reminder to send if not sent immediately
        tasks.push({
          ...baseTask,
          title: `Send email: ${intent.parameters.subject || 'Draft message'}`,
          type: 'scheduled-send',
          priority: 'high',
          dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
          estimatedDuration: 5,
          // If a single email is selected, link it; otherwise omit for now
          linkedEmailId: selectedEmailIds[0]
        });
        break;

      default:
        // Create generic task for other intents
        if (intent.confidence === 'high') {
          tasks.push({
            ...baseTask,
            title: `Complete: ${intent.type} action`,
            type: 'reminder',
            priority: 'low',
            dueDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            estimatedDuration: 5
          });
        }
    }

    return tasks;
  }, [selectedEmailIds]);

  // Intelligently schedule tasks based on workload and context
  const scheduleTasksIntelligently = useCallback(async (tasks: VoiceCreatedTask[]): Promise<VoiceCreatedTask[]> => {
    // Mock intelligent scheduling logic
    // In a real implementation, this would:
    // - Analyze current calendar
    // - Consider email volume and urgency
    // - Apply user preferences for scheduling
    // - Avoid conflicts and optimize for productivity

    return tasks.map(task => {
      // Adjust scheduling based on priority and type
      let adjustedDueDate = task.dueDate;
      
      if (task.priority === 'high') {
        // Schedule high priority tasks sooner
        adjustedDueDate = new Date(task.dueDate.getTime() - 30 * 60 * 1000);
      } else if (task.priority === 'low') {
        // Schedule low priority tasks later
        adjustedDueDate = new Date(task.dueDate.getTime() + 60 * 60 * 1000);
      }

      // Round to next 15-minute interval for clean scheduling
      const minutes = adjustedDueDate.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      adjustedDueDate.setMinutes(roundedMinutes, 0, 0);

      return {
        ...task,
        dueDate: adjustedDueDate
      };
    });
  }, []);

  // Parse schedule time from natural language
  const parseScheduleTime = useCallback((timeString?: string): Date => {
    if (!timeString) return new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour

    const now = new Date();
    const lowerTime = timeString.toLowerCase();

    // Simple parsing - in production, use a proper NLP library
    if (lowerTime.includes('tomorrow')) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (lowerTime.includes('next week')) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (lowerTime.includes('hour')) {
      const hours = parseInt(lowerTime.match(/(\d+)/)?.[1] || '1');
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    } else if (lowerTime.includes('minute')) {
      const minutes = parseInt(lowerTime.match(/(\d+)/)?.[1] || '30');
      return new Date(now.getTime() + minutes * 60 * 1000);
    }

    return new Date(now.getTime() + 60 * 60 * 1000); // Default 1 hour
  }, []);

  // Create task via API
  const createTask = useCallback(async (task: VoiceCreatedTask): Promise<void> => {
    try {
      const response = await fetch('/api/planner/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAccountId,
          task
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Task creation failed:', error);
      // In production, handle error gracefully
    }
  }, [emailAccountId]);

  // Generate task suggestions based on email context
  const generateTaskSuggestions = useCallback(() => {
    const suggestions: VoiceCreatedTask[] = [];
    
    if (selectedEmailIds.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}`,
        title: `Follow up on ${selectedEmailIds.length} selected emails`,
        type: 'follow-up',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        createdBy: 'AI Suggestion',
        createdAt: new Date(),
        status: 'pending',
        estimatedDuration: 15,
        voiceCommand: 'Auto-suggested based on email selection',
        confidence: 0.8,
        autoScheduled: false,
        linkedEmailId: selectedEmailIds[0]
      });
    }

    setSuggestedTasks(suggestions);
  }, [selectedEmailIds]);

  // Get task type icon
  const getTaskIcon = (type: AutoTaskType) => {
    const iconMap = {
      'follow-up': Mail,
      'waiting-on': Clock,
      'scheduled-send': Calendar,
      'meeting': User,
      'reminder': AlertCircle,
      'review': Target
    };
    return iconMap[type] || Plus;
  };

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority];
  };

  if (!isCreating && createdTasks.length === 0 && suggestedTasks.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" />
        <span className="font-medium">Planner Integration</span>
        {isCreating && (
          <Badge variant="secondary" className="text-xs">
            Creating tasks...
          </Badge>
        )}
      </div>

      {/* Creation Progress */}
      {isCreating && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>Analyzing voice command and creating tasks...</span>
          </div>
          <Progress value={creationProgress} className="h-2" />
        </div>
      )}

      {/* Created Tasks */}
      {createdTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Created Tasks</h4>
          {createdTasks.map((task) => {
            const Icon = getTaskIcon(task.type);
            return (
              <div
                key={task.id}
                className={cn(
                  "p-3 rounded-lg border",
                  getPriorityColor(task.priority)
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm">{task.title}</h5>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="capitalize">{task.type.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>Due {task.dueDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {task.estimatedDuration && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            <span>{task.estimatedDuration}m</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                      <span>From: "{task.voiceCommand}"</span>
                      <Badge variant="outline" className="text-xs px-1">
                        {Math.round(task.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Tasks */}
      {suggestedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Suggested Tasks</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={generateTaskSuggestions}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              More suggestions
            </Button>
          </div>
          {suggestedTasks.map((task) => {
            const Icon = getTaskIcon(task.type);
            return (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-900">{task.title}</h5>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <span className="capitalize">{task.type.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>{task.estimatedDuration}m estimated</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2 h-6"
                    onClick={() => {
                      createTask(task);
                      setCreatedTasks(prev => [...prev, task]);
                      setSuggestedTasks(prev => prev.filter(t => t.id !== task.id));
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {(createdTasks.length > 0 || suggestedTasks.length > 0) && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {createdTasks.length} tasks created, {suggestedTasks.length} suggestions available
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

// Hook for managing voice-created tasks
export function useVoicePlanner() {
  const [voiceTasks, setVoiceTasks] = useState<VoiceCreatedTask[]>([]);

  const addVoiceTask = useCallback((task: VoiceCreatedTask) => {
    setVoiceTasks(prev => [...prev, task]);
  }, []);

  const completeVoiceTask = useCallback((taskId: string) => {
    setVoiceTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    ));
  }, []);

  const getTaskStats = useCallback(() => {
    const pending = voiceTasks.filter(t => t.status === 'pending').length;
    const completed = voiceTasks.filter(t => t.status === 'completed').length;
    const byType = voiceTasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<AutoTaskType, number>);

    return { pending, completed, total: voiceTasks.length, byType };
  }, [voiceTasks]);

  return {
    voiceTasks,
    addVoiceTask,
    completeVoiceTask,
    getTaskStats
  };
}
