"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface VoiceCommandProps {
  onResponse?: (response: string) => void;
  userId?: string;
  emailAccountId?: string;
}

export function VoiceCommand({ onResponse, userId, emailAccountId }: VoiceCommandProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Initialize speech recognition
      const recognition = initializeSpeechRecognition();
      if (!recognition) return;

      recognitionRef.current = recognition;
      
      // Start speech recognition
      recognition.start();
      setIsRecording(true);
      setTranscript("");

      // Broadcast mic state → Listening
      try {
        window.dispatchEvent(new CustomEvent("mic:state", { detail: "listening" }));
      } catch {}

      toast.success("Voice recording started. Speak your command...");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start voice recording");
    }
  }, [initializeSpeechRecognition]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (!transcript.trim()) {
      toast.error("No speech detected. Please try again.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Preflight: check assistant health for actionable messaging
      try {
        const healthResp = await fetch('/api/voice', { method: 'GET' });
        const healthJson = await healthResp.json().catch(() => ({} as any));
        if (!healthResp.ok || healthJson?.status !== 'healthy') {
          toast.error(
            `Assistant unavailable. Please ensure the voice service is running.`
          );
          setIsProcessing(false);
          return;
        }
      } catch {
        toast.error(
          'Assistant health check failed. Please ensure the voice service is running.'
        );
        setIsProcessing(false);
        return;
      }

      // Send transcript to voice API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Include email account ID if provided for authentication
      if (emailAccountId) {
        headers['X-Email-Account-ID'] = emailAccountId;
      } else {
        console.error('Voice command missing emailAccountId - this will cause authentication errors');
        toast.error('Voice commands require email account authentication. Please refresh and try again.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: transcript,
          userId: userId,
        }),
      });

      if (!response.ok) {
        let extra = '';
        try {
          const j = await response.json();
          const bits = [
            j?.detail || j?.error,
            j?.cause ? `cause: ${j.cause}` : '',
          ].filter(Boolean);
          extra = bits.join(' | ');
        } catch {
          // ignore JSON parse errors
        }
        toast.error(`API error ${response.status}${extra ? ` — ${extra}` : ''}`);
        setIsProcessing(false);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let fullResponse = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
      }

      // Parse the response (assuming it's JSON lines format)
      const lines = fullResponse.split('\n').filter(line => line.trim());
      let lastMessage = "";
      let audioBase64 = null;
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.messages && data.messages.length > 0) {
            const lastMsg = data.messages[data.messages.length - 1];
            if (lastMsg.content) {
              lastMessage = lastMsg.content;
            }
          }
          // Check for ElevenLabs audio
          if (data.audio_base64) {
            audioBase64 = data.audio_base64;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      if (lastMessage) {
        toast.success("Voice command processed successfully!");
        onResponse?.(lastMessage);
        
        // Play ElevenLabs audio if available, otherwise use browser speech synthesis
        if (audioBase64) {
          try {
            // Convert base64 to audio blob and play
            const audioData = atob(audioBase64);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              audioArray[i] = audioData.charCodeAt(i);
            }
            const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
            };
            
            audio.play().catch(e => {
              console.error('Failed to play ElevenLabs audio:', e);
              // Fallback to browser speech synthesis
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(lastMessage);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                speechSynthesis.speak(utterance);
              }
            });
          } catch (e) {
            console.error('Failed to process ElevenLabs audio:', e);
            // Fallback to browser speech synthesis
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(lastMessage);
              utterance.rate = 0.8;
              utterance.pitch = 1;
              speechSynthesis.speak(utterance);
            }
          }
        } else {
          // Fallback to browser speech synthesis
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(lastMessage);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
          }
        }
      } else {
        toast.error("No response received from the assistant");
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error("Failed to process voice command");
    } finally {
      setIsProcessing(false);
      setTranscript("");
    }
  }, [transcript, userId, onResponse]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={toggleRecording}
        disabled={isProcessing}
        size="lg"
        variant={isRecording ? "destructive" : "primary"}
        className={isRecording ? "animate-pulse" : undefined}
      >
        {isProcessing ? (
          <LoaderIcon className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <MicOffIcon className="h-6 w-6" />
        ) : (
          <MicIcon className="h-6 w-6" />
        )}
        <span className="ml-2">
          {isProcessing
            ? "Processing..."
            : isRecording
              ? "Stop Recording"
              : "Start Voice Command"}
        </span>
      </Button>

      {transcript && (
        <div className="max-w-md p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Transcript:
          </p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Click the microphone to start voice commands. You can say things like:
        <br />
        "Send an email to John about the meeting"
        <br />
        "Add a task to call the client tomorrow"
        <br />
        "Check my recent emails"
      </div>
    </div>
  );
}

// Extend the Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}