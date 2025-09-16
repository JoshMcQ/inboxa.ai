"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Zap,
  Search,
  Send,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Tag,
  Star,
  Reply,
  Forward
} from 'lucide-react';
import { cn } from '@/utils';

// Core intent types based on email actions
export type VoiceIntentType = 
  | 'search' 
  | 'compose' 
  | 'reply' 
  | 'forward'
  | 'archive' 
  | 'delete'
  | 'schedule'
  | 'label'
  | 'star'
  | 'unsubscribe'
  | 'bulk_action'
  | 'navigation'
  | 'filter'
  | 'unknown';

// Intent confidence levels
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Parsed intent structure
export interface VoiceIntent {
  type: VoiceIntentType;
  confidence: ConfidenceLevel;
  parameters: {
    query?: string;
    recipients?: string[];
    subject?: string;
    content?: string;
    emailIds?: string[];
    labels?: string[];
    timeframe?: string;
    scheduleTime?: string;
    filter?: {
      sender?: string;
      subject?: string;
      dateRange?: string;
      hasAttachment?: boolean;
      isUnread?: boolean;
    };
  };
  rawTranscript: string;
  timestamp: Date;
  processingTime?: number;
}

interface VoiceIntentParserProps {
  transcript: string;
  isProcessing?: boolean;
  onIntentParsed: (intent: VoiceIntent) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function VoiceIntentParser({
  transcript,
  isProcessing = false,
  onIntentParsed,
  onError,
  className
}: VoiceIntentParserProps) {
  const [currentIntent, setCurrentIntent] = useState<VoiceIntent | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  // Intent pattern matchers
  const intentPatterns = {
    search: [
      /(?:search|find|look for|show me)\s+(.+)/i,
      /(?:emails|messages)\s+(?:from|about|containing)\s+(.+)/i,
      /(?:where are|what about)\s+(.+)/i
    ],
    compose: [
      /(?:write|compose|send|create)\s+(?:an?\s+)?(?:email|message)\s*(?:to\s+(.+?))?/i,
      /(?:new email|new message)\s*(?:to\s+(.+?))?/i,
      /(?:email|message)\s+(.+?)\s+(?:saying|about)/i
    ],
    reply: [
      /(?:reply|respond)\s+(?:to\s+)?(?:this|that|the\s+email|the\s+message)/i,
      /(?:answer|write back)\s+(?:to\s+)?(.+)/i
    ],
    forward: [
      /(?:forward|share)\s+(?:this|that)\s+(?:email|message)\s+(?:to\s+(.+))?/i,
      /(?:send|share)\s+(?:this|that)\s+(?:to\s+(.+))/i
    ],
    archive: [
      /(?:archive|move)\s+(?:this|that|these)\s*(?:emails?|messages?)?/i,
      /(?:clean up|organize)\s+(?:my\s+)?inbox/i
    ],
    delete: [
      /(?:delete|remove|trash)\s+(?:this|that|these)\s*(?:emails?|messages?)?/i,
      /(?:get rid of|throw away)\s+(.+)/i
    ],
    schedule: [
      /(?:schedule|send later|delay)\s+(?:this|that)\s+(?:for\s+(.+))?/i,
      /(?:remind me|follow up)\s+(?:about\s+)?(.+?)\s+(?:in|at|on)\s+(.+)/i
    ],
    label: [
      /(?:label|tag|categorize)\s+(?:this|these)\s+(?:as\s+(.+))?/i,
      /(?:add|apply)\s+(?:the\s+)?label\s+(.+)/i
    ],
    star: [
      /(?:star|mark)\s+(?:this|these)\s*(?:as\s+important)?/i,
      /(?:important|priority)\s+(?:this|these)/i
    ],
    unsubscribe: [
      /(?:unsubscribe|stop receiving)\s+(?:from\s+)?(.+)/i,
      /(?:block|filter out)\s+(.+)/i
    ],
    navigation: [
      /(?:go to|show me|open)\s+(.+)/i,
      /(?:inbox|sent|drafts|spam|trash)/i
    ]
  };

  // Parse transcript into intent
  const parseIntent = useCallback(async (text: string): Promise<VoiceIntent> => {
    const startTime = Date.now();
    setParsingProgress(0);
    setProcessingSteps(['Analyzing transcript...']);

    // Simulate processing steps
    await new Promise(resolve => setTimeout(resolve, 200));
    setParsingProgress(25);
    setProcessingSteps(prev => [...prev, 'Identifying intent patterns...']);

    let detectedIntent: VoiceIntentType = 'unknown';
    let confidence: ConfidenceLevel = 'low';
    let parameters: VoiceIntent['parameters'] = {};

    // Pattern matching logic
    for (const [intentType, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          detectedIntent = intentType as VoiceIntentType;
          confidence = 'high';
          
          // Extract parameters based on intent type
          switch (intentType) {
            case 'search':
              parameters.query = match[1]?.trim();
              break;
            case 'compose':
              if (match[1]) {
                parameters.recipients = [match[1].trim()];
              }
              break;
            case 'schedule':
              if (match[1]) parameters.content = match[1].trim();
              if (match[2]) parameters.scheduleTime = match[2].trim();
              break;
            case 'label':
              if (match[1]) parameters.labels = [match[1].trim()];
              break;
            case 'unsubscribe':
              if (match[1]) parameters.query = match[1].trim();
              break;
            case 'navigation':
              parameters.query = match[1]?.trim() || text.trim();
              break;
          }
          break;
        }
      }
      if (detectedIntent !== 'unknown') break;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setParsingProgress(75);
    setProcessingSteps(prev => [...prev, 'Extracting parameters...']);

    // Enhanced parameter extraction with NLP-like logic
    if (detectedIntent !== 'unknown') {
      // Extract common email-related entities
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const emails = text.match(emailRegex) || [];
      if (emails.length > 0) {
        parameters.recipients = [...(parameters.recipients || []), ...emails];
      }

      // Extract time references
      const timeWords = /\b(?:today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d+\s*(?:am|pm)|morning|afternoon|evening)\b/gi;
      const timeMatches = text.match(timeWords);
      if (timeMatches && !parameters.scheduleTime) {
        parameters.scheduleTime = timeMatches[0];
      }

      // Extract filter parameters for search
      if (detectedIntent === 'search' || detectedIntent === 'filter') {
        parameters.filter = {};
        
        // From/sender detection
        const fromMatch = text.match(/(?:from|by|sender)\s+([^,\s]+)/i);
        if (fromMatch) parameters.filter.sender = fromMatch[1];
        
        // Unread detection
        if (/unread|new/i.test(text)) parameters.filter.isUnread = true;
        
        // Attachment detection
        if (/attachment|attached|files?/i.test(text)) parameters.filter.hasAttachment = true;
        
        // Date range detection
        const dateMatch = text.match(/(?:last|past)\s+(\d+)\s+(days?|weeks?|months?)/i);
        if (dateMatch) parameters.filter.dateRange = `${dateMatch[1]} ${dateMatch[2]}`;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    setParsingProgress(100);
    setProcessingSteps(prev => [...prev, 'Intent parsing complete']);

    const intent: VoiceIntent = {
      type: detectedIntent,
      confidence,
      parameters,
      rawTranscript: text,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    };

    return intent;
  }, []);

  // Process transcript changes
  useEffect(() => {
    if (!transcript.trim() || isProcessing) return;

    const processTranscript = async () => {
      try {
        const intent = await parseIntent(transcript);
        setCurrentIntent(intent);
        onIntentParsed(intent);
      } catch (error) {
        console.error('Intent parsing failed:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to parse intent');
      }
    };

    // Debounce processing
    const timeout = setTimeout(processTranscript, 500);
    return () => clearTimeout(timeout);
  }, [transcript, isProcessing, parseIntent, onIntentParsed, onError]);

  // Get intent icon
  const getIntentIcon = (type: VoiceIntentType, confidence: ConfidenceLevel) => {
    const iconClass = cn(
      "w-5 h-5",
      confidence === 'high' ? "text-green-600" : 
      confidence === 'medium' ? "text-yellow-600" : "text-gray-400"
    );

    const IconMap = {
      search: Search,
      compose: Send,
      reply: Reply,
      forward: Forward,
      archive: Archive,
      delete: Trash2,
      schedule: Calendar,
      label: Tag,
      star: Star,
      unsubscribe: RefreshCw,
      bulk_action: CheckCircle,
      navigation: Search,
      filter: Search,
      unknown: AlertCircle
    };

    const IconComponent = IconMap[type];
    return <IconComponent className={iconClass} />;
  };

  if (!currentIntent && !isProcessing) {
    return null;
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-sm">Intent Analysis</span>
        </div>
        
        {isProcessing && (
          <Badge variant="secondary" className="text-xs">
            Processing...
          </Badge>
        )}
      </div>

      {isProcessing ? (
        <div className="mt-3 space-y-2">
          <Progress value={parsingProgress} className="h-2" />
          <div className="text-xs text-gray-600 space-y-1">
            {processingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-blue-500" />
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : currentIntent ? (
        <div className="mt-3 space-y-3">
          {/* Intent Type & Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIntentIcon(currentIntent.type, currentIntent.confidence)}
              <span className="font-medium capitalize">
                {currentIntent.type.replace('_', ' ')}
              </span>
            </div>
            <Badge 
              variant={
                currentIntent.confidence === 'high' ? 'default' : 
                currentIntent.confidence === 'medium' ? 'secondary' : 
                'outline'
              }
              className="text-xs"
            >
              {currentIntent.confidence} confidence
            </Badge>
          </div>

          {/* Parameters */}
          {Object.keys(currentIntent.parameters).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Extracted Parameters:</h4>
              <div className="bg-gray-50 rounded-lg p-2 text-xs space-y-1">
                {currentIntent.parameters.query && (
                  <div><strong>Query:</strong> {currentIntent.parameters.query}</div>
                )}
                {currentIntent.parameters.recipients?.length && (
                  <div><strong>Recipients:</strong> {currentIntent.parameters.recipients.join(', ')}</div>
                )}
                {currentIntent.parameters.scheduleTime && (
                  <div><strong>Schedule:</strong> {currentIntent.parameters.scheduleTime}</div>
                )}
                {currentIntent.parameters.labels?.length && (
                  <div><strong>Labels:</strong> {currentIntent.parameters.labels.join(', ')}</div>
                )}
                {currentIntent.parameters.filter && Object.keys(currentIntent.parameters.filter).length > 0 && (
                  <div>
                    <strong>Filters:</strong>
                    <div className="ml-2 mt-1 space-y-0.5">
                      {currentIntent.parameters.filter.sender && (
                        <div>• From: {currentIntent.parameters.filter.sender}</div>
                      )}
                      {currentIntent.parameters.filter.isUnread && (
                        <div>• Unread only</div>
                      )}
                      {currentIntent.parameters.filter.hasAttachment && (
                        <div>• With attachments</div>
                      )}
                      {currentIntent.parameters.filter.dateRange && (
                        <div>• From last {currentIntent.parameters.filter.dateRange}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Processed in {currentIntent.processingTime}ms</span>
            <span>{currentIntent.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

// Hook for managing intent history and analytics
export function useVoiceIntents() {
  const [intentHistory, setIntentHistory] = useState<VoiceIntent[]>([]);
  const [currentIntent, setCurrentIntent] = useState<VoiceIntent | null>(null);

  const addIntent = useCallback((intent: VoiceIntent) => {
    setCurrentIntent(intent);
    setIntentHistory(prev => [intent, ...prev].slice(0, 50)); // Keep last 50 intents
  }, []);

  const clearHistory = useCallback(() => {
    setIntentHistory([]);
    setCurrentIntent(null);
  }, []);

  const getIntentStats = useCallback(() => {
    const total = intentHistory.length;
    const byType = intentHistory.reduce((acc, intent) => {
      acc[intent.type] = (acc[intent.type] || 0) + 1;
      return acc;
    }, {} as Record<VoiceIntentType, number>);

    const byConfidence = intentHistory.reduce((acc, intent) => {
      acc[intent.confidence] = (acc[intent.confidence] || 0) + 1;
      return acc;
    }, {} as Record<ConfidenceLevel, number>);

    const avgProcessingTime = total > 0 
      ? intentHistory.reduce((sum, intent) => sum + (intent.processingTime || 0), 0) / total 
      : 0;

    return {
      total,
      byType,
      byConfidence,
      avgProcessingTime: Math.round(avgProcessingTime)
    };
  }, [intentHistory]);

  return {
    intentHistory,
    currentIntent,
    addIntent,
    clearHistory,
    getIntentStats
  };
}