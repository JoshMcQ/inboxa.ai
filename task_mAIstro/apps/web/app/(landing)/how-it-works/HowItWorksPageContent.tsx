"use client";

import { motion } from "framer-motion";
import { 
  LinkIcon, 
  BrainIcon, 
  MessageSquareIcon, 
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  SettingsIcon,
  RocketIcon
} from "lucide-react";

const detailedSteps = [
  {
    number: "1",
    title: "Quick Setup (2 minutes)",
    icon: LinkIcon,
    description: "Connect your Gmail account with secure OAuth authentication",
    details: [
      "Click 'Connect Gmail' and authorize InboxaAI",
      "Your credentials are never stored - we use secure OAuth tokens",
      "Choose which email accounts to connect",
      "Set your initial preferences"
    ]
  },
  {
    number: "2",
    title: "AI Learning Phase (24 hours)",
    icon: BrainIcon,
    description: "Our AI analyzes your email patterns and communication style",
    details: [
      "Processes your email history to understand patterns",
      "Learns your writing style and common responses",
      "Identifies important contacts and relationships",
      "Builds your personalized communication profile"
    ]
  },
  {
    number: "3",
    title: "Start Using Voice Commands",
    icon: MessageSquareIcon,
    description: "Manage your inbox through natural conversation",
    details: [
      "Say 'Check my emails' for instant briefings",
      "Use 'Reply to Sarah' to draft responses",
      "Ask 'What needs my attention?' for priorities",
      "Command 'Schedule follow-up' for task creation"
    ]
  },
  {
    number: "4",
    title: "Continuous Improvement",
    icon: CheckCircleIcon,
    description: "The AI gets smarter with every interaction",
    details: [
      "Learns from your corrections and preferences",
      "Adapts to new communication patterns",
      "Improves response suggestions over time",
      "Customizes automation based on your behavior"
    ]
  }
];

const useCases = [
  {
    title: "Morning Email Briefing",
    icon: ClockIcon,
    scenario: "Start your day with a voice-powered summary of overnight emails",
    example: "Good morning! You have 3 urgent emails: one from your manager about the quarterly review, a client request from TechCorp, and a meeting reschedule from Sarah."
  },
  {
    title: "Hands-Free Response",
    icon: MessageSquareIcon,
    scenario: "Reply to emails while commuting or multitasking",
    example: "Draft a reply to John saying I'll review the proposal by Friday and schedule a meeting for next week to discuss."
  },
  {
    title: "Smart Search",
    icon: BrainIcon,
    scenario: "Find emails using natural language, not keywords",
    example: "Show me all emails about the budget from last month that mentioned increasing headcount."
  },
  {
    title: "Automatic Follow-ups",
    icon: RocketIcon,
    scenario: "Never forget important tasks or commitments",
    example: "I'll create a reminder to follow up with the client about their feedback on Monday at 9 AM."
  }
];

export function HowItWorksPageContent() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              How InboxaAI Works
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              From setup to daily use, see how easy it is to transform your email experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {detailedSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col lg:flex-row gap-8 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-[#1a365d] text-white rounded-full">
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <step.icon className="h-8 w-8 text-[#1a365d]" />
                    <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Visual demonstration of {step.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Real-World Use Cases
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See InboxaAI in action with these common scenarios
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#1a365d] bg-opacity-10 rounded-lg">
                    <useCase.icon className="h-6 w-6 text-[#1a365d]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{useCase.scenario}</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic">"{useCase.example}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <ShieldCheckIcon className="h-16 w-16 text-[#1a365d] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">
              Your Privacy and Security Matter
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              InboxaAI uses bank-level encryption and never stores your email credentials. 
              Your data is isolated and encrypted, accessible only to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1a365d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands who've transformed their email experience
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-[#1a365d] bg-white hover:bg-gray-100"
            >
              Start Your Free Trial
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}