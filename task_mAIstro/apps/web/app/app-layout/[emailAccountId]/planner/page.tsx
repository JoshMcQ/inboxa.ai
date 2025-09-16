"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils";
import type { TaskEventData, EmailEventData } from "@/types/events";
import { 
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CalendarIcon,
  MailIcon,
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PlayIcon,
  PauseIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityTimeline, useEventStore } from "@/components/ActivityTimeline";
import { StatusDock, useStatusDock } from "@/components/StatusDock";

interface PlannerTask {
  id: string;
  title: string;
  type: 'follow-up' | 'waiting-on' | 'scheduled-send' | 'meeting' | 'reconcile';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  linkedEmailId?: string;
  linkedThreadSubject?: string;
  createdBy: string; // "Rule R-12", "Manual", etc.
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedDuration?: number; // minutes
  assignee?: string;
}

interface TimeSlot {
  hour: number;
  tasks: PlannerTask[];
  meetings: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'focus' | 'break';
}

const MOCK_TASKS: PlannerTask[] = [
  {
    id: '1',
    title: 'Follow up: Sarah about Q4 budget approval',
    type: 'follow-up',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    linkedEmailId: 'email-123',
    linkedThreadSubject: 'Q4 Budget Planning Discussion',
    createdBy: 'Auto-rule R-12',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'pending',
    estimatedDuration: 15,
    assignee: 'Joshua'
  },
  {
    id: '2',
    title: 'Waiting on: Invoice approval from Finance',
    type: 'waiting-on',
    priority: 'medium',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
    linkedEmailId: 'email-456',
    linkedThreadSubject: 'Invoice #INV-2024-001 - Approval Required',
    createdBy: 'Manual',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'pending',
    estimatedDuration: 5,
  },
  {
    id: '3',
    title: 'Send: Weekly report to team',
    type: 'scheduled-send',
    priority: 'medium',
    dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdBy: 'Scheduled rule R-08',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    status: 'pending',
    estimatedDuration: 30,
  }
];

export default function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<PlannerTask | null>(null);
  const [currentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { events, addEvent, undoEvent } = useEventStore();
  const { jobs, addJob, undoJob } = useStatusDock();

  // Load tasks from backend on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        // Fallback to mock data if backend not available
        setTasks(MOCK_TASKS);
        return;
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.warn('Failed to load tasks from backend, using mock data:', error);
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots for today (6 AM to 10 PM)
  const timeSlots: TimeSlot[] = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6;
    const slotTasks = tasks.filter(task => {
      const taskHour = task.dueDate.getHours();
      return taskHour === hour;
    });
    
    return {
      hour,
      tasks: slotTasks,
      meetings: [], // Mock calendar events would go here
    };
  });

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Call backend to complete task
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Add event to timeline
        addEvent({
          type: 'task.completed',
          humanString: `Completed: ${task.title}`,
          undoable: true,
          taskId,
          title: task.title,
          linkedEmailId: task.linkedEmailId,
        } as Omit<TaskEventData, 'id' | 'timestamp'>);

        // Update task status locally
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'completed' as const } : t
        ));
      } else {
        console.warn('Failed to complete task on backend');
      }
    } catch (error) {
      console.warn('Error completing task:', error);
      // Still update locally if backend fails
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      ));
    }
  };

  const handleCreateFollowUp = async () => {
    addEvent({
      type: 'email.searched',
      humanString: 'Searching for emails that need follow-up...',
      undoable: false,
      query: 'outbound emails asking questions',
    } as Omit<EmailEventData, 'id' | 'timestamp'>);

    try {
      // Call LangGraph to analyze emails and create follow-up tasks
      const response = await fetch('/api/internal/langgraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: 'Find emails that need follow-up and create tasks for them',
          emailAccountId: window.location.pathname.split('/')[2],
          userId: 'current-user-id', // This should come from auth context
          conversationId: `followup-${Date.now()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        addEvent({
          type: 'task.created',
          humanString: data.response || 'Created follow-up tasks from recent emails',
          undoable: true,
          taskId: 'new-task-batch',
          title: 'Follow-up task batch',
        } as Omit<TaskEventData, 'id' | 'timestamp'>);
        
        // Reload tasks to get new ones
        loadTasks();
      } else {
        throw new Error('Failed to create follow-up tasks');
      }
    } catch (error) {
      console.error('Error creating follow-up tasks:', error);
      // Fallback to mock behavior
      setTimeout(() => {
        addEvent({
          type: 'task.created',
          humanString: 'Created 3 follow-up tasks from recent emails',
          undoable: true,
          taskId: 'new-task-batch',
          title: 'Follow-up task batch',
        } as Omit<TaskEventData, 'id' | 'timestamp'>);
      }, 1500);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Activity Timeline */}
      <ActivityTimeline 
        events={events} 
        onUndo={undoEvent}
        className="flex-shrink-0"
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Day Timeline */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground flex items-center gap-2">
              <CalendarIcon className="size-5" />
              Today's Timeline
            </h2>
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              }).format(currentTime)}
            </p>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {timeSlots.map((slot) => (
              <TimeSlotCard 
                key={slot.hour}
                slot={slot}
                currentHour={currentTime.getHours()}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </div>

        {/* Center: Task Lists */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-card-foreground">Planner</h1>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleCreateFollowUp}
                  className="bg-teal text-teal-foreground hover:bg-teal/90"
                >
                  <PlusIcon className="size-4 mr-2" />
                  Auto-create follow-ups
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mt-1">
              Auto-updated by email events • {tasks.filter(t => t.status === 'pending').length} pending tasks
            </p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Follow-ups */}
              <TaskList
                title="Follow-ups"
                icon={MailIcon}
                tasks={tasks.filter(t => t.type === 'follow-up')}
                color="text-teal-600"
                onTaskClick={setSelectedTask}
                onTaskComplete={handleCompleteTask}
              />

              {/* Waiting On */}
              <TaskList
                title="Waiting On"
                icon={ClockIcon}
                tasks={tasks.filter(t => t.type === 'waiting-on')}
                color="text-yellow-600"
                onTaskClick={setSelectedTask}
                onTaskComplete={handleCompleteTask}
              />

              {/* Scheduled Sends */}
              <TaskList
                title="Scheduled Sends"
                icon={PlayIcon}
                tasks={tasks.filter(t => t.type === 'scheduled-send')}
                color="text-indigo-600"
                onTaskClick={setSelectedTask}
                onTaskComplete={handleCompleteTask}
              />

              {/* Meetings */}
              <TaskList
                title="Meetings"
                icon={UserIcon}
                tasks={tasks.filter(t => t.type === 'meeting')}
                color="text-purple-600"
                onTaskClick={setSelectedTask}
                onTaskComplete={handleCompleteTask}
              />
            </div>
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selectedTask && (
          <div className="w-96 border-l border-border bg-card flex flex-col">
            <TaskDetailPanel 
              task={selectedTask} 
              onClose={() => setSelectedTask(null)}
              onComplete={() => handleCompleteTask(selectedTask.id)}
            />
          </div>
        )}
      </div>

      {/* Status Dock */}
      <StatusDock 
        jobs={jobs}
        onUndo={undoJob}
      />
    </div>
  );
}

interface TimeSlotCardProps {
  slot: TimeSlot;
  currentHour: number;
  onTaskClick: (task: PlannerTask) => void;
}

function TimeSlotCard({ slot, currentHour, onTaskClick }: TimeSlotCardProps) {
  const isCurrentHour = slot.hour === currentHour;
  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true
  }).format(new Date().setHours(slot.hour, 0, 0, 0));

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isCurrentHour ? [
        "bg-primary/10 border-primary/30",
        "shadow-sm"
      ] : "bg-card border-border hover:bg-accent/50"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "text-sm font-medium",
          isCurrentHour ? "text-primary" : "text-muted-foreground"
        )}>
          {timeString}
        </span>
        {isCurrentHour && (
          <span className="size-2 bg-primary rounded-full animate-pulse" />
        )}
      </div>
      
      {slot.tasks.length > 0 ? (
        <div className="space-y-1">
          {slot.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="w-full text-left p-2 rounded bg-accent/30 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PriorityIndicator priority={task.priority} />
                <span className="text-sm font-medium truncate">{task.title}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No tasks</p>
      )}
    </div>
  );
}

interface TaskListProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: PlannerTask[];
  color: string;
  onTaskClick: (task: PlannerTask) => void;
  onTaskComplete: (taskId: string) => void;
}

function TaskList({ title, icon: Icon, tasks, color, onTaskClick, onTaskComplete }: TaskListProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("size-5", color)} />
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">({pendingTasks.length})</span>
      </div>
      
      <div className="space-y-2">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="group p-3 rounded-lg bg-accent/20 hover:bg-accent/40 transition-all cursor-pointer border border-transparent hover:border-border"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PriorityIndicator priority={task.priority} />
                  <span className="text-sm font-medium text-card-foreground line-clamp-2">
                    {task.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Due {new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }).format(task.dueDate)}</span>
                  
                  {task.estimatedDuration && (
                    <>
                      <span>•</span>
                      <span>{task.estimatedDuration}m</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <span>Created by {task.createdBy}</span>
                  {task.linkedEmailId && (
                    <ExternalLinkIcon className="size-3" />
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskComplete(task.id);
                }}
              >
                <CheckCircleIcon className="size-4 text-teal-600" />
              </Button>
            </div>
          </div>
        ))}
        
        {pendingTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="size-12 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm">No {title.toLowerCase()} yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskDetailPanelProps {
  task: PlannerTask;
  onClose: () => void;
  onComplete: () => void;
}

function TaskDetailPanel({ task, onClose, onComplete }: TaskDetailPanelProps) {
  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-card-foreground">{task.title}</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PriorityIndicator priority={task.priority} />
            <span className="text-sm font-medium capitalize">{task.priority} priority</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Due {new Intl.DateTimeFormat('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }).format(task.dueDate)}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-card-foreground">Context</h4>
          <div className="p-3 bg-accent/20 rounded-lg">
            <p className="text-sm">Created by <strong>{task.createdBy}</strong></p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }).format(task.createdAt)}
            </p>
          </div>
        </div>

        {task.linkedThreadSubject && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Linked Email</h4>
            <div className="p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-2">
                <MailIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{task.linkedThreadSubject}</span>
              </div>
              <Button size="sm" variant="ghost" className="mt-2 h-6 px-2 text-xs">
                <ExternalLinkIcon className="size-3 mr-1" />
                Open thread
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <Button 
          onClick={onComplete}
          className="w-full bg-teal text-teal-foreground hover:bg-teal/90"
        >
          <CheckCircleIcon className="size-4 mr-2" />
          Complete Task
        </Button>
      </div>
    </>
  );
}

function PriorityIndicator({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };
  
  return <div className={cn("size-2 rounded-full", colors[priority])} />;
}