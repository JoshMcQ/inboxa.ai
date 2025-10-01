"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircleIcon,
  MailIcon,
  MicIcon,
  SettingsIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "lucide-react";

/**
 * InboxA.AI Onboarding Flow
 * 3 steps per spec:
 * 1. Connect Mail → Gmail/Outlook integration
 * 2. Enable Voice → Mic permission + voice test + device picker  
 * 3. Preferences → Tone, signature, work hours, SLA windows
 * 
 * Redirects to /today when complete
 */

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ onNext: () => void; onBack: () => void }>;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Connect Mail",
    description: "Link your Gmail or Outlook account",
    icon: <MailIcon className="w-6 h-6" />,
    component: ConnectMailStep,
  },
  {
    id: 2,
    title: "Setup Voice",
    description: "Configure the ElevenLabs voice widget",
    icon: <MicIcon className="w-6 h-6" />,
    component: EnableVoiceStep,
  },
  {
    id: 3,
    title: "Preferences",
    description: "Customize your assistant settings",
    icon: <SettingsIcon className="w-6 h-6" />,
    component: PreferencesStep,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete, redirect to Today
      router.push('/today');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {steps[currentStep - 1]?.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="action-card">
          {CurrentStepComponent && (
            <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
          )}
        </Card>
      </div>
    </div>
  );
}

function ConnectMailStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnectGmail = async () => {
    setConnecting(true);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnecting(false);
    onNext();
  };

  return (
    <div className="text-center space-y-6">
      <div>
        <MailIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connect your email account
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          InboxA.AI needs access to your email to help you manage your inbox. 
          We only access what we need and never share your data.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleConnectGmail}
          disabled={connecting}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {connecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting to Gmail...
            </>
          ) : (
            <>
              <MailIcon className="w-4 h-4" />
              Connect Gmail
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          className="w-full btn-secondary flex items-center justify-center gap-2"
          disabled={connecting}
        >
          <MailIcon className="w-4 h-4" />
          Connect Outlook
        </Button>
      </div>

      <div className="text-xs text-gray-500 max-w-sm mx-auto">
        By connecting your email, you agree to InboxA.AI's privacy policy and terms of service.
      </div>
    </div>
  );
}

function EnableVoiceStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      console.error('Microphone permission denied:', error);
    }
  };

  const handleTestVoice = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MicIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Setup voice assistant
        </h2>
        <p className="text-gray-600">
          InboxA.ai uses the ElevenLabs voice widget. This appears as a floating orb in the bottom right corner of the app for natural voice conversations.
        </p>
      </div>

      <div className="space-y-4">
        {/* Permission Step */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            hasPermission ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {hasPermission ? (
              <CheckCircleIcon className="w-4 h-4 text-white" />
            ) : (
              <span className="text-xs font-medium text-gray-600">1</span>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Microphone Permission</div>
            <div className="text-sm text-gray-600">Allow access to your microphone</div>
          </div>
          {!hasPermission && (
            <Button onClick={handleRequestPermission} size="sm">
              Allow
            </Button>
          )}
        </div>

        {/* Voice Test Step */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            hasPermission ? 'bg-indigo-600' : 'bg-gray-300'
          }`}>
            <span className="text-xs font-medium text-white">2</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Widget Check</div>
            <div className="text-sm text-gray-600">Look for the ElevenLabs orb in the bottom right corner</div>
          </div>
          {hasPermission && (
            <Button onClick={handleTestVoice} disabled={testing} size="sm">
              {testing ? 'Testing...' : 'Play sample' }
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 btn-secondary">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!hasPermission}
          className="flex-1 btn-primary"
        >
          Next
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PreferencesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [preferences, setPreferences] = useState({
    tone: 'professional',
    signature: '',
    workHours: '9-5',
    sla: '24h'
  });

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <SettingsIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Set your preferences
        </h2>
        <p className="text-gray-600">
          Customize how your AI assistant communicates and manages your inbox.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Communication Tone
          </label>
          <select
            value={preferences.tone}
            onChange={(e) => handlePreferenceChange('tone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-control focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Signature
          </label>
          <textarea
            value={preferences.signature}
            onChange={(e) => handlePreferenceChange('signature', e.target.value)}
            placeholder="Best regards,&#10;John Doe"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-control focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Hours
          </label>
          <select
            value={preferences.workHours}
            onChange={(e) => handlePreferenceChange('workHours', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-control focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="24/7">24/7</option>
            <option value="9-5">9 AM - 5 PM</option>
            <option value="8-6">8 AM - 6 PM</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Response SLA
          </label>
          <select
            value={preferences.sla}
            onChange={(e) => handlePreferenceChange('sla', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-control focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="24h">24 hours</option>
            <option value="48h">48 hours</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 btn-secondary">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 btn-primary">
          Complete Setup
          <CheckCircleIcon className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
