"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils';

interface VoiceState {
  isListening: boolean;
  isThinking: boolean;
  isActing: boolean;
  volume: number;
  partialTranscript: string;
  finalTranscript: string;
  detectedIntent: string | null;
  error: string | null;
}

interface AgentStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  timestamp: Date;
  data?: Record<string, any>;
}

interface VoiceControllerProps {
  onVoiceCommand: (transcript: string, intent: string) => Promise<void>;
  onAgentStep: (step: AgentStep) => void;
  className?: string;
}

export function VoiceController({ 
  onVoiceCommand, 
  onAgentStep, 
  className 
}: VoiceControllerProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isThinking: false,
    isActing: false,
    volume: 0,
    partialTranscript: '',
    finalTranscript: '',
    detectedIntent: null,
    error: null
  });

  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context and analyzer for volume visualization
  const initializeAudioAnalysis = useCallback(async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyserRef.current && voiceState.isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const volume = (average / 255) * 100;
          
          setVoiceState(prev => ({ ...prev, volume }));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
    }
  }, [voiceState.isListening]);

  // Start voice recording with live transcription
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Initialize volume visualization
      await initializeAudioAnalysis(stream);

      // Set up MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };

      mediaRecorderRef.current.start();
      
      setVoiceState(prev => ({
        ...prev,
        isListening: true,
        partialTranscript: '',
        finalTranscript: '',
        error: null
      }));

      // Start live transcription (mock for now - would integrate with STT service)
      simulateLiveTranscription();

    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Failed to access microphone. Please check permissions.',
        isListening: false
      }));
    }
  }, [initializeAudioAnalysis]);

  // Stop voice recording
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && voiceState.isListening) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setVoiceState(prev => ({
      ...prev,
      isListening: false,
      isThinking: true,
      volume: 0
    }));
  }, [voiceState.isListening]);

  // Simulate live transcription (replace with real STT service)
  const simulateLiveTranscription = useCallback(() => {
    const mockPhrases = [
      "find delta receipts from july",
      "unsubscribe the worst 20 promo senders", 
      "reply yes and ask for calendar link",
      "show all unread from sarah",
      "archive all promotions this week"
    ];
    
    const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    const words = randomPhrase.split(' ');
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < words.length && voiceState.isListening) {
        const partialText = words.slice(0, currentIndex + 1).join(' ');
        setVoiceState(prev => ({ ...prev, partialTranscript: partialText }));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (voiceState.isListening) {
          setVoiceState(prev => ({ 
            ...prev, 
            finalTranscript: randomPhrase,
            partialTranscript: ''
          }));
        }
      }
    }, 200);
  }, [voiceState.isListening]);

  // Process voice input and detect intent
  const processVoiceInput = useCallback(async (audioBlob: Blob) => {
    try {
      setVoiceState(prev => ({ ...prev, isThinking: true }));

      // Mock intent detection (replace with real NLU service)
      const transcript = voiceState.finalTranscript || voiceState.partialTranscript;
      const detectedIntent = detectIntent(transcript);
      
      setVoiceState(prev => ({ 
        ...prev, 
        detectedIntent,
        isThinking: false,
        isActing: true
      }));

      // Execute the voice command
      await onVoiceCommand(transcript, detectedIntent);
      
      setVoiceState(prev => ({ ...prev, isActing: false }));
      
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Failed to process voice command',
        isThinking: false,
        isActing: false
      }));
    }
  }, [voiceState.finalTranscript, voiceState.partialTranscript, onVoiceCommand]);

  // Mock intent detection (replace with sophisticated NLU)
  const detectIntent = (transcript: string): string => {
    const text = transcript.toLowerCase();
    
    if (text.includes('find') || text.includes('search') || text.includes('show')) {
      return 'search';
    } else if (text.includes('reply') || text.includes('respond')) {
      return 'compose';
    } else if (text.includes('delete') || text.includes('archive')) {
      return 'archive';
    } else if (text.includes('unsubscribe')) {
      return 'unsubscribe';
    } else if (text.includes('schedule') || text.includes('snooze')) {
      return 'schedule';
    } else {
      return 'general';
    }
  };

  // Get current state display
  const getCurrentStateDisplay = () => {
    if (voiceState.isListening) {
      return {
        label: 'Listening',
        icon: <Mic className="w-4 h-4 text-green-500 animate-pulse" />,
        color: 'bg-green-100 text-green-800'
      };
    } else if (voiceState.isThinking) {
      return {
        label: 'Thinking',
        icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
        color: 'bg-blue-100 text-blue-800'
      };
    } else if (voiceState.isActing) {
      return {
        label: 'Acting',
        icon: <Zap className="w-4 h-4 text-orange-500 animate-bounce" />,
        color: 'bg-orange-100 text-orange-800'
      };
    } else {
      return {
        label: 'Ready',
        icon: <MicOff className="w-4 h-4 text-gray-500" />,
        color: 'bg-gray-100 text-gray-800'
      };
    }
  };

  const stateDisplay = getCurrentStateDisplay();

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Voice State Indicator */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={cn("flex items-center gap-2", stateDisplay.color)}>
          {stateDisplay.icon}
          {stateDisplay.label}
        </Badge>
        
        {voiceState.detectedIntent && (
          <Badge variant="outline" className="text-xs">
            Intent: {voiceState.detectedIntent}
          </Badge>
        )}
      </div>

      {/* Volume Meter (when listening) */}
      {voiceState.isListening && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <Progress value={voiceState.volume} className="flex-1" />
          </div>
        </div>
      )}

      {/* Live Captions */}
      {(voiceState.partialTranscript || voiceState.finalTranscript) && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">You:</div>
          <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] flex items-center">
            {voiceState.isListening && voiceState.partialTranscript ? (
              <span className="text-gray-600 italic">
                {voiceState.partialTranscript}
                <span className="animate-pulse ml-1">|</span>
              </span>
            ) : (
              <span className="text-gray-900">{voiceState.finalTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Push-to-Talk Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant={voiceState.isListening ? "destructive" : "default"}
          className={cn(
            "rounded-full w-16 h-16 p-0 transition-all duration-200",
            voiceState.isListening && "scale-110 shadow-lg"
          )}
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={voiceState.isThinking || voiceState.isActing}
        >
          {voiceState.isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-500">
        {voiceState.isListening 
          ? "Release to stop" 
          : "Hold to speak or say 'Hey Inboxa'"
        }
      </div>

      {/* Error Display */}
      {voiceState.error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" />
          {voiceState.error}
        </div>
      )}
    </Card>
  );
}
