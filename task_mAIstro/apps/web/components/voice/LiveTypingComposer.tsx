"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Send,
  Edit3,
  X,
  Check,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { cn } from '@/utils';

interface LiveTypingComposerProps {
  content: string;
  isTyping: boolean;
  typingSpeed?: number; // Characters per second
  onTypingComplete?: () => void;
  onSend?: (content: string) => void;
  onEdit?: (content: string) => void;
  onCancel?: () => void;
  recipient?: string;
  subject?: string;
  className?: string;
}

export function LiveTypingComposer({
  content,
  isTyping,
  typingSpeed = 50, // Realistic typing speed
  onTypingComplete,
  onSend,
  onEdit,
  onCancel,
  recipient,
  subject,
  className
}: LiveTypingComposerProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReviewBar, setShowReviewBar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [showTTS, setShowTTS] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Start typing animation
  useEffect(() => {
    if (!isTyping || isPaused) return;

    // Reset state when content changes
    if (content !== editedContent) {
      setDisplayedContent('');
      setCurrentIndex(0);
      setEditedContent(content);
    }

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= content.length) {
          clearInterval(interval);
          setShowReviewBar(true);
          onTypingComplete?.();
          return prevIndex;
        }
        
        const newIndex = prevIndex + 1;
        setDisplayedContent(content.slice(0, newIndex));
        return newIndex;
      });
    }, 1000 / typingSpeed);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [content, isTyping, isPaused, typingSpeed, onTypingComplete, editedContent]);

  // Auto-scroll cursor into view
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [displayedContent]);

  // Handle typing controls
  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleSkip = () => {
    setDisplayedContent(content);
    setCurrentIndex(content.length);
    setShowReviewBar(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onTypingComplete?.();
  };

  const handleRestart = () => {
    setDisplayedContent('');
    setCurrentIndex(0);
    setShowReviewBar(false);
    setIsPaused(false);
  };

  // Handle review actions
  const handleSend = () => {
    onSend?.(editedContent);
    setShowReviewBar(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowReviewBar(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    setShowReviewBar(true);
    onEdit?.(editedContent);
  };

  const handleCancelEdit = () => {
    setEditedContent(displayedContent);
    setIsEditing(false);
    setShowReviewBar(true);
  };

  const handleCancel = () => {
    onCancel?.();
    setShowReviewBar(false);
  };

  // Text-to-speech for draft content
  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      if (showTTS) {
        speechSynthesis.cancel();
        setShowTTS(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(displayedContent);
        utterance.onend = () => setShowTTS(false);
        speechSynthesis.speak(utterance);
        setShowTTS(true);
      }
    }
  };

  // Calculate typing progress
  const progress = content.length > 0 ? (currentIndex / content.length) * 100 : 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Composing Reply</h3>
              {recipient && (
                <p className="text-sm text-gray-600">To: {recipient}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isTyping && !showReviewBar && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(progress)}% complete
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={isPaused ? handleResume : handlePause}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSkip}>
                  <Check className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {showReviewBar && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTTS}
                className={showTTS ? "text-blue-600" : ""}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        {isTyping && !showReviewBar && (
          <Progress value={progress} className="mt-3 h-1" />
        )}
      </div>

      {/* Content Area */}
      <div className="p-4">
        {subject && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
            <strong>Subject:</strong> {subject}
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Check className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
              <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="min-h-[200px] p-3 bg-white border rounded font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {displayedContent}
              {isTyping && !showReviewBar && (
                <span
                  ref={cursorRef}
                  className="animate-pulse bg-blue-500 ml-0.5 inline-block w-0.5 h-5"
                />
              )}
            </div>
            
            {/* Typing indicator */}
            {isTyping && !showReviewBar && (
              <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                AI typing...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Bar */}
      {showReviewBar && !isEditing && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Review your draft</span>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="ghost" size="sm">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button onClick={handleRestart} variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              <Button onClick={handleSend} size="sm">
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Pause className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Typing paused</span>
              <Button onClick={handleResume} size="sm">
                Resume
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

// Hook for managing multiple drafts
export function useLiveTyping() {
  const [activeDrafts, setActiveDrafts] = useState<Map<string, string>>(new Map());
  const [typingStates, setTypingStates] = useState<Map<string, boolean>>(new Map());

  const startTyping = (draftId: string, content: string) => {
    setActiveDrafts(prev => new Map(prev).set(draftId, content));
    setTypingStates(prev => new Map(prev).set(draftId, true));
  };

  const stopTyping = (draftId: string) => {
    setTypingStates(prev => {
      const next = new Map(prev);
      next.set(draftId, false);
      return next;
    });
  };

  const removeDraft = (draftId: string) => {
    setActiveDrafts(prev => {
      const next = new Map(prev);
      next.delete(draftId);
      return next;
    });
    setTypingStates(prev => {
      const next = new Map(prev);
      next.delete(draftId);
      return next;
    });
  };

  const updateDraft = (draftId: string, content: string) => {
    setActiveDrafts(prev => new Map(prev).set(draftId, content));
  };

  return {
    activeDrafts,
    typingStates,
    startTyping,
    stopTyping,
    removeDraft,
    updateDraft,
    isTyping: (draftId: string) => typingStates.get(draftId) || false,
    getDraft: (draftId: string) => activeDrafts.get(draftId),
  };
}
