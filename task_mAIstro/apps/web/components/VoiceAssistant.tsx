"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Zap, 
  Search,
  Mail,
  Trash2,
  Archive,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioBase64?: string
  type?: 'command' | 'response' | 'status'
  metadata?: {
    action?: string
    status?: 'success' | 'error' | 'progress'
    progress?: number
  }
}

interface AgentStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  description?: string
  progress?: number
}

interface AgentState {
  isActive: boolean
  currentStep?: string
  steps: AgentStep[]
  caption: string
}

interface VoiceAssistantProps {
  className?: string
  showTransparentAgent?: boolean
}

export function VoiceAssistant({ className, showTransparentAgent = true }: VoiceAssistantProps) {
  // State management
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  
  // Transparent Agent State
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    steps: [],
    caption: 'Ready to assist with your emails'
  })
  
  // Refs
  // WebKit speech recognition type (browser-provided)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const agentTimelineRef = useRef<HTMLDivElement>(null)
  
  // Agent steps configuration
  const createAgentSteps = (command: string): AgentStep[] => {
    const baseSteps: AgentStep[] = [
      { id: 'parse', label: 'Parse Command', status: 'pending', description: 'Understanding your request' },
      { id: 'search', label: 'Search', status: 'pending', description: 'Searching through emails' },
      { id: 'process', label: 'Process', status: 'pending', description: 'Processing results' },
      { id: 'execute', label: 'Execute', status: 'pending', description: 'Performing actions' },
      { id: 'complete', label: 'Complete', status: 'pending', description: 'Finishing up' },
    ]
    
    // Customize steps based on command type
    if (command.toLowerCase().includes('delete') || command.toLowerCase().includes('unsubscribe')) {
      baseSteps[3] = { ...baseSteps[3], label: 'Confirm Deletion', description: 'Preparing destructive actions' }
    } else if (command.toLowerCase().includes('reply') || command.toLowerCase().includes('send')) {
      baseSteps[2] = { ...baseSteps[2], label: 'Compose', description: 'Drafting email response' }
      baseSteps[3] = { ...baseSteps[3], label: 'Review & Send', description: 'Reviewing draft before sending' }
    }
    
    return baseSteps
  }
  
  const updateAgentStep = (stepId: string, updates: Partial<AgentStep>) => {
    setAgentState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
      currentStep: updates.status === 'in_progress' ? stepId : prev.currentStep
    }))
  }
  
  const setAgentCaption = (caption: string) => {
    setAgentState(prev => ({ ...prev, caption }))
  }
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition: any = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        setCurrentTranscript('')
      }
      
      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setCurrentTranscript(transcript)
        
        // If the result is final, process the command
        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript)
          setCurrentTranscript('')
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setCurrentTranscript('')
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
    
    // Check voice service status
    checkVoiceService()
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Check if voice service is available
  const checkVoiceService = async () => {
    try {
      setConnectionStatus('connecting')
      const response = await fetch('http://localhost:2024/voice/info')
      if (response.ok) {
        const data = await response.json()
        setIsVoiceEnabled(data.enabled)
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Failed to connect to voice service:', error)
      setConnectionStatus('disconnected')
    }
  }
  
  // Start/stop voice recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isListening])
  
  // Process voice command through the API with transparent agent
  const processVoiceCommand = async (command: string) => {
    if (!command.trim()) return
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: command,
      timestamp: new Date(),
      type: 'command'
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    
    // Initialize transparent agent
    const steps = createAgentSteps(command)
    setAgentState({
      isActive: true,
      steps,
      caption: 'Processing your command...',
      currentStep: 'parse'
    })
    
    // Simulate agent progress
    const simulateAgentProgress = async () => {
      // Step 1: Parse Command
      updateAgentStep('parse', { status: 'in_progress' })
      setAgentCaption(`Parsing: "${command}"`)
      await new Promise(resolve => setTimeout(resolve, 800))
      updateAgentStep('parse', { status: 'completed' })
      
      // Step 2: Search
      updateAgentStep('search', { status: 'in_progress', progress: 0 })
      setAgentCaption('Searching through your emails...')
      
      // Simulate search progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        updateAgentStep('search', { progress: i })
      }
      updateAgentStep('search', { status: 'completed' })
      
      // Step 3: Process
      updateAgentStep('process', { status: 'in_progress' })
      if (command.toLowerCase().includes('reply')) {
        setAgentCaption('Composing response in your voice...')
      } else if (command.toLowerCase().includes('delete')) {
        setAgentCaption('Identifying emails for deletion...')
      } else {
        setAgentCaption('Processing results...')
      }
      await new Promise(resolve => setTimeout(resolve, 1200))
      updateAgentStep('process', { status: 'completed' })
      
      // Step 4: Execute
      updateAgentStep('execute', { status: 'in_progress' })
      setAgentCaption('Executing actions...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateAgentStep('execute', { status: 'completed' })
      
      // Step 5: Complete
      updateAgentStep('complete', { status: 'in_progress' })
      setAgentCaption('Finishing up...')
      await new Promise(resolve => setTimeout(resolve, 600))
      updateAgentStep('complete', { status: 'completed' })
      
      setAgentCaption('Task completed successfully')
    }
    
    // Start agent simulation
    simulateAgentProgress()
    
    try {
      // Send to task_mAIstro API
      const response = await fetch('http://localhost:2024/runs/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistant_id: 'task_mAIstro',
          input: {
            messages: [{ role: 'user', content: command }]
          },
          config: {
            configurable: {
              user_id: 'default_user',
              todo_category: 'general',
              task_maistro_role: 'You are InboxA.ai, a transparent AI email assistant. Show your work and explain each step clearly.'
            }
          },
          enable_voice: isVoiceEnabled
        })
      })
      
      if (!response.ok) throw new Error('API request failed')
      
      // Process streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      let assistantContent = ''
      let audioBase64 = null
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.messages && data.messages.length > 0) {
              const lastMessage = data.messages[data.messages.length - 1]
              if (lastMessage.content && typeof lastMessage.content === 'string') {
                assistantContent = lastMessage.content
              }
            }
            if (data.audio_base64) {
              audioBase64 = data.audio_base64
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
      
      // Add assistant response
      if (assistantContent) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          audioBase64: audioBase64 || undefined,
          type: 'response',
          metadata: {
            status: 'success'
          }
        }
        
        setMessages(prev => [...prev, assistantMessage])
        
        // Complete agent state
        setAgentState(prev => ({
          ...prev,
          isActive: false,
          caption: 'Ready for your next command'
        }))
        
        // Play audio response if available
        if (audioBase64 && isVoiceEnabled) {
          playAudioResponse(audioBase64)
        }
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error)
      
      // Update agent state with error
      const currentStep = agentState.currentStep || 'parse'
      updateAgentStep(currentStep, { status: 'error' })
      setAgentCaption('⚠️ Error processing request')
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I encountered an issue processing your request. Please check the connection and try again.',
        timestamp: new Date(),
        type: 'response',
        metadata: {
          status: 'error'
        }
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      // Reset agent state after delay
      setTimeout(() => {
        setAgentState({
          isActive: false,
          steps: [],
          caption: 'Ready to assist with your emails'
        })
      }, 3000)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Play audio response
  const playAudioResponse = (audioBase64: string) => {
    try {
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(e => console.error('Audio play failed:', e))
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }
  
  // Clear conversation
  const clearConversation = () => {
    setMessages([])
  }

  // Agent Timeline Component
  const AgentTimeline = () => (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* Timeline Header */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-medium text-sm">Agent Timeline</h3>
        </div>
      </div>
      
      {/* Caption Bar */}
      <div className="px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center space-x-2">
          <Loader2 className={cn(
            "w-4 h-4",
            agentState.isActive ? "animate-spin text-primary" : "text-muted-foreground"
          )} />
          <p className="text-sm text-muted-foreground flex-1">
            {agentState.caption}
          </p>
        </div>
      </div>
      
      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agentState.steps.map((step, index) => {
          const isActive = step.status === 'in_progress'
          const isCompleted = step.status === 'completed'
          const isError = step.status === 'error'
          
          return (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < agentState.steps.length - 1 && (
                <div className="absolute left-3 top-8 w-px h-6 bg-border" />
              )}
              
              <div className="flex items-start space-x-3">
                {/* Step Icon */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-success border-success text-success-foreground",
                  isActive && "bg-primary border-primary text-primary-foreground animate-pulse",
                  isError && "bg-destructive border-destructive text-destructive-foreground",
                  step.status === 'pending' && "bg-background border-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : isError ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-success",
                    isActive && "text-primary", 
                    isError && "text-destructive",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                  
                  {/* Progress Bar */}
                  {step.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}\n                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
  
  return (
    <div className={cn(
      "flex h-full max-h-[800px] bg-background border rounded-xl shadow-lg overflow-hidden",
      className
    )}>
      {/* Agent Timeline - Left Rail */}
      {showTransparentAgent && <AgentTimeline />}
      
      {/* Main Assistant Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                InboxA.ai Assistant
              </h2>
              <p className="text-sm text-muted-foreground">
                Voice-first email management
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus === 'connected' ? 'Connected' : 'Offline'}
            </Badge>
            {isVoiceEnabled && (
              <Badge variant="secondary">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice
              </Badge>
            )}
          </div>
        </div>
      
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Ready to help with your emails
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Tap the microphone and speak naturally. Try saying "Read my emails" or "Send an email to John"
              </p>
              
              {/* Quick Action Suggestions */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-left h-auto p-3 flex-col items-start space-y-1"
                  onClick={() => processVoiceCommand("Read my unread emails")}
                >
                  <Mail className="w-4 h-4 text-primary mb-1" />
                  <span className="text-xs font-medium">Read emails</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-left h-auto p-3 flex-col items-start space-y-1"
                  onClick={() => processVoiceCommand("Show me newsletters to unsubscribe")}
                >
                  <Trash2 className="w-4 h-4 text-primary mb-1" />
                  <span className="text-xs font-medium">Clean inbox</span>
                </Button>
              </div>
            </div>
          )}
        
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex animate-fade-in",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <Card
                variant={message.role === 'user' ? "default" : "ghost"}
                className={cn(
                  "max-w-[80%] transition-all duration-normal hover:shadow-md",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground ml-4"
                    : "mr-4",
                  message.metadata?.status === 'error' && "border-destructive bg-destructive/5"
                )}
              >
                <div className="p-4">
                  {/* Message Type Indicator */}
                  {message.type === 'command' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                      <span className="text-xs font-medium opacity-80">Voice Command</span>
                    </div>
                  )}
                  
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  
                  {/* Audio Playback & Metadata */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {message.audioBase64 && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => playAudioResponse(message.audioBase64!)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {message.metadata?.status && (
                        <Badge
                          variant={
                            message.metadata.status === 'success' 
                              ? "default" 
                              : message.metadata.status === 'error'
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {message.metadata.status}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {/* Current transcript - Live transcription */}
          {currentTranscript && (
            <div className="flex justify-end animate-scale-in">
              <Card variant="ghost" className="max-w-[80%] ml-4 border-dashed border-primary/50 bg-primary/5">
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary">Listening...</span>
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {currentTranscript}
                  </p>
                </div>
              </Card>
            </div>
          )}
          
          {/* Processing indicator */}
          {isProcessing && !showTransparentAgent && (
            <div className="flex justify-start animate-fade-in">
              <Card variant="ghost" className="mr-4">
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Processing your request...</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        
        <div ref={messagesEndRef} />
      </div>
        
        {/* Controls */}
        <div className="p-6 border-t bg-card/50">
          <div className="flex items-center justify-center space-x-6">
            {/* Main Mic Button */}
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
              <Button
                size="icon-lg"
                variant={isListening ? "destructive" : "default"}
                className={cn(
                  "w-16 h-16 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden",
                  isListening 
                    ? "bg-destructive hover:bg-destructive/90 animate-gentle-glow" 
                    : "bg-gradient-to-br from-primary to-primary/80 hover:shadow-xl hover:scale-105",
                  !recognitionRef.current || connectionStatus !== 'connected' && "opacity-50 cursor-not-allowed"
                )}
                onClick={toggleListening}
                disabled={!recognitionRef.current || connectionStatus !== 'connected'}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 text-destructive-foreground" />
                ) : (
                  <Mic className="w-6 h-6 text-primary-foreground" />
                )}
              </Button>
            </div>
            
            {/* Secondary Controls */}
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearConversation}
                disabled={messages.length === 0}
                className="transition-all duration-normal hover:scale-105"
              >
                Clear Chat
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={checkVoiceService}
                className="transition-all duration-normal hover:scale-105"
              >
                <Settings className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive font-medium">
                  Voice service offline
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Ensure task_mAIstro server is running on localhost:2024
              </p>
            </div>
          )}
          
          {/* Voice Capabilities Info */}
          {connectionStatus === 'connected' && messages.length === 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Try these voice commands:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  '"Read my unread emails"',
                  '"Reply to Sarah"',
                  '"Archive all newsletters"',
                  '"Show me emails from yesterday"'
                ].map((command, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => processVoiceCommand(command.replace(/"/g, ''))}
                  >
                    {command}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  )
}
