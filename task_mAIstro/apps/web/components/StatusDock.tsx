"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils";
import { 
  Loader2Icon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UndoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QueuedJob {
  id: string;
  type: 'unsubscribe' | 'delete' | 'archive' | 'label' | 'send';
  title: string;
  total: number;
  completed: number;
  status: 'running' | 'completed' | 'error' | 'paused';
  undoable: boolean;
  undoTimeLeft?: number; // seconds
  errorMessage?: string;
  startTime: Date;
}

interface StatusDockProps {
  jobs: QueuedJob[];
  onUndo?: (jobId: string) => void;
  onPause?: (jobId: string) => void;
  onResume?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

export function StatusDock({ jobs, onUndo, onPause, onResume, onCancel }: StatusDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [undoCountdowns, setUndoCountdowns] = useState<Record<string, number>>({});

  const activeJobs = jobs.filter(job => job.status !== 'completed');
  const completedJobs = jobs.filter(job => job.status === 'completed');

  // Handle undo countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setUndoCountdowns(prev => {
        const updated = { ...prev };
        let hasChanges = false;

        jobs.forEach(job => {
          if (job.undoTimeLeft && job.undoTimeLeft > 0) {
            updated[job.id] = job.undoTimeLeft - 1;
            hasChanges = true;
          } else if (updated[job.id] !== undefined) {
            delete updated[job.id];
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [jobs]);

  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "bg-card border border-border rounded-lg shadow-lg min-w-80 max-w-md",
        "transition-all duration-300 ease-out",
        isExpanded ? "max-h-96" : "max-h-20"
      )}>
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {activeJobs.length > 0 ? (
              <Loader2Icon className="size-4 animate-spin text-primary" />
            ) : (
              <CheckCircleIcon className="size-4 text-teal-500" />
            )}
            <span className="font-medium text-sm">
              {activeJobs.length > 0 
                ? `${activeJobs.length} job${activeJobs.length === 1 ? '' : 's'} running`
                : `${completedJobs.length} completed`
              }
            </span>
          </div>
          
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            {isExpanded ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronUpIcon className="size-4" />
            )}
          </Button>
        </div>

        {/* Jobs list */}
        {isExpanded && (
          <div className="max-h-64 overflow-auto border-t border-border">
            {activeJobs.map((job) => (
              <JobItem 
                key={job.id} 
                job={job} 
                undoTimeLeft={undoCountdowns[job.id] || job.undoTimeLeft}
                onUndo={onUndo}
                onPause={onPause}
                onResume={onResume}
                onCancel={onCancel}
              />
            ))}
            
            {completedJobs.length > 0 && activeJobs.length > 0 && (
              <div className="px-3 py-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium">Recently Completed</p>
              </div>
            )}
            
            {completedJobs.slice(0, 3).map((job) => (
              <JobItem 
                key={job.id} 
                job={job} 
                undoTimeLeft={undoCountdowns[job.id] || job.undoTimeLeft}
                onUndo={onUndo}
                onPause={onPause}
                onResume={onResume}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface JobItemProps {
  job: QueuedJob;
  undoTimeLeft?: number;
  onUndo?: (jobId: string) => void;
  onPause?: (jobId: string) => void;
  onResume?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

function JobItem({ job, undoTimeLeft, onUndo, onPause, onResume, onCancel }: JobItemProps) {
  const progress = job.total > 0 ? (job.completed / job.total) * 100 : 0;
  const isRunning = job.status === 'running';
  const isPaused = job.status === 'paused';
  const isCompleted = job.status === 'completed';
  const hasError = job.status === 'error';

  return (
    <div className="p-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isRunning && <Loader2Icon className="size-3 animate-spin text-primary flex-shrink-0" />}
            {isCompleted && <CheckCircleIcon className="size-3 text-teal-500 flex-shrink-0" />}
            {hasError && <XCircleIcon className="size-3 text-red-500 flex-shrink-0" />}
            {isPaused && <div className="size-3 bg-yellow-500 rounded-full flex-shrink-0" />}
            
            <p className="text-sm font-medium truncate">{job.title}</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{job.completed}/{job.total}</span>
            {hasError && job.errorMessage && (
              <span className="text-red-500">• {job.errorMessage}</span>
            )}
          </div>
          
          {/* Progress bar */}
          {!isCompleted && (
            <div className="mt-2 bg-secondary rounded-full h-1.5 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  hasError ? "bg-red-500" : isPaused ? "bg-yellow-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {/* Undo button with countdown */}
          {job.undoable && undoTimeLeft && undoTimeLeft > 0 && onUndo && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
              onClick={() => onUndo(job.id)}
            >
              <UndoIcon className="size-3 mr-1" />
              Undo ({undoTimeLeft}s)
            </Button>
          )}
          
          {/* Pause/Resume for running jobs */}
          {isRunning && onPause && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onPause(job.id)}
            >
              Pause
            </Button>
          )}
          
          {isPaused && onResume && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onResume(job.id)}
            >
              Resume
            </Button>
          )}
          
          {/* Cancel for running/paused jobs */}
          {(isRunning || isPaused) && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
              onClick={() => onCancel(job.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing queued jobs
export function useStatusDock() {
  const [jobs, setJobs] = useState<QueuedJob[]>([]);

  const addJob = (job: Omit<QueuedJob, 'id' | 'startTime'>) => {
    const newJob: QueuedJob = {
      ...job,
      id: crypto.randomUUID(),
      startTime: new Date(),
    };
    
    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const updateJob = (jobId: string, updates: Partial<QueuedJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const undoJob = (jobId: string) => {
    console.log('Undoing job:', jobId);
    // In a real app, this would call the API to undo the job
    removeJob(jobId);
  };

  return {
    jobs,
    addJob,
    updateJob,
    removeJob,
    undoJob,
  };
}