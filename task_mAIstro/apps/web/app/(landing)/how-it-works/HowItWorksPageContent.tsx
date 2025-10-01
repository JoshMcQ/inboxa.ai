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
  RocketIcon,
  LockIcon
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
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden pt-24 pb-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              How InboxaAI Works
            </h1>
            <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
              From setup to daily use, see how easy it is to transform your email experience
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Detailed Steps */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {detailedSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-10 xl:grid xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-12"
              >
                <div>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 sm:-translate-y-7">
                      <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-teal-500 text-white rounded-full shadow-lg">
                        <span className="text-2xl font-bold">{step.number}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-5">
                        <step.icon className="h-8 w-8 text-[#1a365d]" />
                        <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                      </div>
                      <p className="text-lg text-gray-600 mb-8 leading-relaxed">{step.description}</p>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens:</h3>
                        <ul className="space-y-4">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Step {step.number} Visualization
                    </h4>
                    <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-200">
                      <div className="space-y-3">
                        <div className="h-2 bg-gradient-to-r from-primary/20 to-teal-500/20 rounded-full"></div>
                        <div className="h-2 bg-gradient-to-r from-primary/40 to-teal-500/40 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gradient-to-r from-primary/60 to-teal-500/60 rounded-full w-1/2"></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Interactive demo coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Process Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-24 bg-gradient-to-r from-primary/5 to-teal-500/5 rounded-xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                The Complete Process
              </h3>
              <p className="text-gray-600">
                From setup to daily productivity - your journey with InboxaAI
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              {detailedSteps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-teal-500 text-white rounded-full flex items-center justify-center mb-3 font-bold">
                    {step.number}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600 max-w-32">{step.description.split('.')[0]}</p>
                  {index < detailedSteps.length - 1 && (
                    <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-primary to-teal-500 mt-6"></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Real-World Use Cases
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              See InboxaAI in action with these common scenarios that save time and boost productivity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg">
                    <useCase.icon className="h-8 w-8 text-[#1a365d]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">{useCase.scenario}</p>
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border-l-4 border-primary">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 italic leading-relaxed">
                      "{useCase.example}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mid-section CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Try These Use Cases?
              </h3>
              <p className="text-gray-600 mb-6">
                Experience these scenarios firsthand with your own email
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Free Trial
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="h-12 w-12 text-[#1a365d]" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Privacy and Security Matter
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              InboxaAI uses bank-level encryption and never stores your email credentials.
              Your data is isolated and encrypted, accessible only to you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm">All data is encrypted in transit and at rest</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <LockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">No Credential Storage</h3>
              <p className="text-gray-600 text-sm">We never store your email passwords</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SettingsIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">SOC 2 Compliance</h3>
              <p className="text-gray-600 text-sm">Audited security practices and procedures</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Join thousands who've transformed their email experience with AI-powered productivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
              </a>
              <a
                href="/features"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Explore Features
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              No credit card required • Setup in 2 minutes • Works with Gmail
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
