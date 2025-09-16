"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { AgentTheater } from './AgentTheater';
import { useEmailHighlights } from './EmailHighlighter';
import { LiveTypingComposer } from './LiveTypingComposer';
import { VoiceUndoSystem } from './VoiceUndoSystem';
import { VoiceIntentParser, useVoiceIntents, VoiceIntent } from './VoiceIntentParser';
import { VoicePlannerIntegration, useVoicePlanner } from './VoicePlannerIntegration';
import { cn } from '@/utils';

interface VoiceEvent {
  type: 'conversation_started' | 'conversation_ended' | 'agent_step' | 'email_action' | 'draft_created' | 'undo_available';
  data: any;
  timestamp: Date;
}

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

interface VoiceOrchestratorProps {
  emailAccountId: string;
  isActive: boolean;
  className?: string;
}

export function VoiceOrchestrator({ 
  emailAccountId, 
  isActive, 
  className 
}: VoiceOrchestratorProps) {
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isParsingIntent, setIsParsingIntent] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const {
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    setMultipleHighlights,
    getHighlight
  } = useEmailHighlights();

  const {
    intentHistory,
    currentIntent,
    addIntent,
    clearHistory
  } = useVoiceIntents();

  const {
    voiceTasks,
    addVoiceTask,
    getTaskStats
  } = useVoicePlanner();

  // Connect to ElevenLabs widget events and backend SSE
  useEffect(() => {
    if (!isActive) return;

    // Listen for ElevenLabs widget events
    const handleElevenLabsEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'conversation_started':
          handleConversationStart(data);
          break;
        case 'conversation_ended':
          handleConversationEnd();
          break;
        case 'agent_thinking':
          handleAgentThinking(data);
          break;
        case 'agent_action':
          handleAgentAction(data);
          break;
      }
    };

    // Connect to Server-Sent Events for real-time updates
    eventSourceRef.current = new EventSource(
      `/api/voice/events?emailAccountId=${emailAccountId}`
    );

    eventSourceRef.current.onmessage = (event) => {
      const voiceEvent: VoiceEvent = JSON.parse(event.data);
      processVoiceEvent(voiceEvent);
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('Voice event stream error:', error);
    };

    // Listen for ElevenLabs widget custom events
    window.addEventListener('elevenlabs-event', handleElevenLabsEvent as EventListener);

    return () => {
      eventSourceRef.current?.close();
      window.removeEventListener('elevenlabs-event', handleElevenLabsEvent as EventListener);
    };
  }, [isActive, emailAccountId]);

  // Handle intent parsing
  const handleIntentParsed = useCallback(async (intent: VoiceIntent) => {
    setIsParsingIntent(false);
    addIntent(intent);
    
    // Create agent step for intent
    const intentStep: AgentStep = {
      id: `intent-${Date.now()}`,
      type: intent.type as any,
      label: `Intent: ${intent.type}`,
      description: `Detected ${intent.type} command with ${intent.confidence} confidence`,
      status: 'completed',
      timestamp: new Date(),
      duration: intent.processingTime,
      data: {
        query: intent.parameters.query,
        emailIds: intent.parameters.emailIds,
        undoable: false
      }
    };
    
    setAgentSteps(prev => [...prev, intentStep]);
    
    // Execute intent if actionable
    if (intent.confidence === 'high' && intent.type !== 'unknown') {
      await executeIntent(intent);
    }
  }, [addIntent]);

  // Execute parsed intent
  const executeIntent = useCallback(async (intent: VoiceIntent) => {
    const executionStep: AgentStep = {
      id: `execute-${Date.now()}`,
      type: intent.type as any,
      label: `Execute: ${intent.type}`,
      description: `Executing ${intent.type} action...`,
      status: 'in_progress',
      timestamp: new Date(),
      data: intent.parameters
    };
    
    setAgentSteps(prev => [...prev, executionStep]);

    try {
      // Handle different intent types
      switch (intent.type) {
        case 'search':
          await handleSearchIntent(intent);
          break;
        case 'compose':
          await handleComposeIntent(intent);
          break;
        case 'reply':
          await handleReplyIntent(intent);
          break;
        case 'archive':
        case 'delete':
          await handleBulkActionIntent(intent);
          break;
        default:
          throw new Error(`Unsupported intent type: ${intent.type}`);
      }

      // Mark as completed
      setAgentSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { ...step, status: 'completed', duration: Date.now() - step.timestamp.getTime() }
          : step
      ));

    } catch (error) {
      console.error('Intent execution failed:', error);
      setAgentSteps(prev => prev.map(step => 
        step.id === executionStep.id 
          ? { ...step, status: 'error', duration: Date.now() - step.timestamp.getTime() }
          : step
      ));
    }
  }, []);

  // Handle search intent
  const handleSearchIntent = useCallback(async (intent: VoiceIntent) => {
    const { query, filter } = intent.parameters;
    
    // TODO: Implement actual email search API call
    // For now, don't highlight any emails until we have real search results
    console.log('Voice search intent:', { query, filter });
    
    // Clear any existing highlights
    clearAllHighlights();
    
    // Note: Real implementation would:
    // 1. Call Gmail API search with query
    // 2. Get matching thread IDs
    // 3. Highlight only those threads
  }, [clearAllHighlights]);

  // Handle compose intent
  const handleComposeIntent = useCallback(async (intent: VoiceIntent) => {
    const { recipients, subject, content } = intent.parameters;
    
    const draftContent = content || `Draft composed via voice command`;
    setCurrentDraft(draftContent);
    setIsTyping(true);
  }, []);

  // Handle reply intent
  const handleReplyIntent = useCallback(async (intent: VoiceIntent) => {
    // Similar to compose but for replies
    const replyContent = `Reply via voice: ${intent.parameters.content || 'Voice-composed reply'}`;
    setCurrentDraft(replyContent);
    setIsTyping(true);
  }, []);

  // Handle bulk action intent
  const handleBulkActionIntent = useCallback(async (intent: VoiceIntent) => {
    const { emailIds } = intent.parameters;
    
    console.log('Bulk action intent:', { intent: intent.type, emailIds });
    
    // TODO: Only highlight if we have real email IDs from actual selection
    if (emailIds?.length) {
      // Highlight emails to be affected (only if they are real thread IDs)
      setMultipleHighlights(
        emailIds,
        {
          type: intent.type === 'delete' ? 'pending_delete' : 'selected',
          reason: `Selected for ${intent.type}`,
          temporary: true,
        }
      );
    }
  }, [setMultipleHighlights]);

  // Handle conversation start
  const handleConversationStart = useCallback((data: any) => {
    setIsConversationActive(true);
    setAgentSteps([]);
    clearAllHighlights();
    clearHistory();
    setCurrentTranscript('');
    setIsParsingIntent(false);
    
    // Add initial step
    const initialStep: AgentStep = {
      id: 'conversation-start',
      type: 'review',
      label: 'Conversation Started',
      description: 'Listening to your voice command...',
      status: 'in_progress',
      timestamp: new Date()
    };
    
    setAgentSteps([initialStep]);
    
    // Extract transcript if available
    if (data?.transcript) {
      setCurrentTranscript(data.transcript);
      setIsParsingIntent(true);
    }
  }, [clearAllHighlights, clearHistory]);

  // Handle conversation end
  const handleConversationEnd = useCallback(() => {
    setIsConversationActive(false);
    setCurrentDraft(null);
    setIsTyping(false);
    
    // Mark final step as completed
    setAgentSteps(prev => prev.map(step => 
      step.status === 'in_progress' 
        ? { ...step, status: 'completed', duration: Date.now() - step.timestamp.getTime() }
        : step
    ));
  }, []);

  // Handle agent thinking phase
  const handleAgentThinking = useCallback((data: any) => {
    const thinkingStep: AgentStep = {
      id: `thinking-${Date.now()}`,
      type: 'search',
      label: 'Processing Command',
      description: `Understanding: "${data.transcript}"`,
      status: 'in_progress',
      timestamp: new Date(),
      data: {
        query: data.transcript
      }
    };
    
    setAgentSteps(prev => [...prev.slice(0, -1), thinkingStep]);
  }, []);

  // Handle agent actions
  const handleAgentAction = useCallback((data: any) => {
    const actionStep: AgentStep = {
      id: `action-${Date.now()}`,
      type: data.actionType,
      label: data.label,
      description: data.description,
      status: 'in_progress',
      timestamp: new Date(),
      data: data.metadata
    };
    
    setAgentSteps(prev => [...prev, actionStep]);
  }, []);

  // Process voice events from SSE
  const processVoiceEvent = useCallback((event: VoiceEvent) => {
    switch (event.type) {
      case 'agent_step':
        handleAgentStepUpdate(event.data);
        break;
      case 'email_action':
        handleEmailAction(event.data);
        break;
      case 'draft_created':
        handleDraftCreated(event.data);
        break;
      case 'undo_available':
        handleUndoAvailable(event.data);
        break;
    }
  }, []);

  // Handle agent step updates
  const handleAgentStepUpdate = useCallback((stepData: any) => {
    setAgentSteps(prev => prev.map(step => 
      step.id === stepData.id 
        ? { 
            ...step, 
            status: stepData.status,
            progress: stepData.progress,
            duration: stepData.duration 
          }
        : step
    ));

    // Update email highlights based on step
    if (stepData.emailIds?.length) {
      switch (stepData.type) {
        case 'search':
          setMultipleHighlights(stepData.emailIds, {
            type: 'match',
            confidence: stepData.confidence,
            reason: `Matches: "${stepData.query}"`,
            animation: 'flash',
            temporary: true
          });
          break;
        case 'delete':
          setMultipleHighlights(stepData.emailIds, {
            type: 'pending_delete',
            reason: 'Marked for deletion',
            animation: 'shake'
          });
          break;
        case 'archive':
          setMultipleHighlights(stepData.emailIds, {
            type: 'pending_archive',
            reason: 'Will be archived',
            animation: 'pulse'
          });
          break;
      }
    }
  }, [setMultipleHighlights]);

  // Handle email actions
  const handleEmailAction = useCallback((actionData: any) => {
    const { emailIds, action, reason } = actionData;
    
    emailIds.forEach((emailId: string) => {
      switch (action) {
        case 'selected':
          addHighlight(emailId, {
            type: 'selected',
            reason: reason || 'Selected by voice command'
          });
          break;
        case 'processed':
          addHighlight(emailId, {
            type: 'processing',
            reason: 'Processing action...'
          });
          break;
      }
    });
  }, [addHighlight]);

  // Handle draft creation
  const handleDraftCreated = useCallback((draftData: any) => {
    setCurrentDraft(draftData.content);
    setIsTyping(true);
    
    const draftStep: AgentStep = {
      id: `draft-${Date.now()}`,
      type: 'compose',
      label: 'Composing Reply',
      description: 'Drafting your message...',
      status: 'in_progress',
      timestamp: new Date(),
      data: {
        draftContent: draftData.content,
        recipientCount: draftData.recipients?.length || 1
      }
    };
    
    setAgentSteps(prev => [...prev, draftStep]);
  }, []);

  // Handle undo availability
  const handleUndoAvailable = useCallback((undoData: any) => {
    // Update the relevant step to show it's undoable
    setAgentSteps(prev => prev.map(step => 
      step.id === undoData.stepId 
        ? { ...step, data: { ...step.data, undoable: true } }
        : step
    ));
  }, []);

  // Handle step interactions
  const handleStepClick = useCallback((step: AgentStep) => {
    // Focus on related emails if available
    if (step.data?.emailIds?.length) {
      step.data.emailIds.forEach((emailId: string) => {
        const highlight = getHighlight(emailId);
        if (highlight) {
          addHighlight(emailId, {
            ...highlight,
            animation: 'glow'
          });
        }
      });
    }
  }, [getHighlight, addHighlight]);

  // Handle undo actions
  const handleUndo = useCallback(async (stepId: string) => {
    try {
      const response = await fetch(`/api/voice/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stepId,
          emailAccountId 
        })
      });
      
      if (response.ok) {
        // Update step to show it was undone
        setAgentSteps(prev => prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'cancelled' }
            : step
        ));
        
        // Clear related highlights
        const step = agentSteps.find(s => s.id === stepId);
        if (step?.data?.emailIds) {
          step.data.emailIds.forEach(emailId => {
            removeHighlight(emailId);
          });
        }
      }
    } catch (error) {
      console.error('Failed to undo action:', error);
    }
  }, [emailAccountId, agentSteps, removeHighlight]);

  // Handle typing completion
  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    
    // Update draft step to completed
    setAgentSteps(prev => prev.map(step => 
      step.type === 'compose' && step.status === 'in_progress'
        ? { ...step, status: 'completed', duration: Date.now() - step.timestamp.getTime() }
        : step
    ));
  }, []);

  return (
    <div className={cn("grid grid-cols-3 gap-4 h-full", className)}>
      {/* Agent Theater - Step by step visualization */}
      <div className="col-span-1">
        <AgentTheater
          steps={agentSteps}
          isActive={isConversationActive}
          onStepClick={handleStepClick}
          onUndo={handleUndo}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="col-span-2 space-y-4">
        {/* Voice Intent Parser */}
        {(currentTranscript || isParsingIntent) && (
          <VoiceIntentParser
            transcript={currentTranscript}
            isProcessing={isParsingIntent}
            onIntentParsed={handleIntentParsed}
            onError={(error) => console.error('Intent parsing error:', error)}
          />
        )}

        {/* Live Draft Composer */}
        {currentDraft && (
          <LiveTypingComposer
            content={currentDraft}
            isTyping={isTyping}
            onTypingComplete={handleTypingComplete}
          />
        )}
        
        {/* Voice Planner Integration */}
        <VoicePlannerIntegration
          emailAccountId={emailAccountId}
          voiceIntent={currentIntent ?? undefined}
          selectedEmailIds={[]} // Could be populated from highlighted emails
          onTaskCreated={addVoiceTask}
          onTaskScheduled={(task, scheduledTime) => {
            console.log(`Task scheduled: ${task.title} for ${scheduledTime}`);
          }}
        />

        {/* Voice Undo System */}
        <VoiceUndoSystem 
          emailAccountId={emailAccountId}
          recentActions={agentSteps.filter(s => s.data?.undoable && s.status === 'completed')}
        />
        
        {/* Status Display */}
        {isConversationActive && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Voice conversation active - speak naturally to control your emails
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Hook to integrate with email list components
export function useVoiceEmailIntegration(emailId: string) {
  const {
    getHighlight,
    addHighlight,
    removeHighlight
  } = useEmailHighlights();
  
  const highlightState = getHighlight(emailId);
  
  const markAsProcessed = useCallback(() => {
    addHighlight(emailId, {
      type: 'processing',
      reason: 'Processing voice command...'
    });
  }, [emailId, addHighlight]);
  
  const clearHighlight = useCallback(() => {
    removeHighlight(emailId);
  }, [emailId, removeHighlight]);
  
  return {
    highlightState,
    markAsProcessed,
    clearHighlight
  };
}
