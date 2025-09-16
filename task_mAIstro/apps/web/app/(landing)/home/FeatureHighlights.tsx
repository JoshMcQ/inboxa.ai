"use client";

import { motion } from "framer-motion";
import { SearchIcon, PenToolIcon, CalendarIcon, ShieldCheckIcon, SparklesIcon, BrainIcon, ZapIcon, MailIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI Task Creation",
    description: "Automatically creates follow-up tasks, meeting requests, and reminders from your email conversations. Never miss important actions again.",
    icon: SparklesIcon,
    color: "from-primary to-purple-500",
    demo: "task-creation"
  },
  {
    title: "Smart Email Search",
    description: "Find any email using natural language. Ask 'emails about budget from Sarah' and get instant, relevant results.",
    icon: SearchIcon,
    color: "from-teal-500 to-cyan-500",
    demo: "smart-search"
  },
  {
    title: "Voice Commands",
    description: "Control your entire inbox with voice. Create tasks, search emails, and manage your workflow hands-free.",
    icon: BrainIcon,
    color: "from-orange-500 to-red-500",
    demo: "voice-control"
  },
  {
    title: "Email Intelligence",
    description: "AI categorizes, prioritizes, and analyzes your emails for actionable insights and automated responses.",
    icon: ZapIcon,
    color: "from-green-500 to-emerald-500",
    demo: "email-intelligence"
  }
];

export function FeatureHighlights() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 to-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/5 to-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 mb-6">
            <SparklesIcon className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Features That Transform
            <span className="block bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              How You Work
            </span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of email management with AI that understands context, anticipates needs, and automates your workflow.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                {/* Icon and Title */}
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Demo */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-border/50">
                  {feature.demo === "task-creation" && (
                    <TaskCreationDemo />
                  )}
                  {feature.demo === "smart-search" && (
                    <SmartSearchDemo />
                  )}
                  {feature.demo === "voice-control" && (
                    <VoiceControlDemo />
                  )}
                  {feature.demo === "email-intelligence" && (
                    <EmailIntelligenceDemo />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TaskCreationDemo() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-700 mb-3">Email → AI Task Creation</div>
      
      {/* Email Preview */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>
          <div className="text-sm font-medium">Mike Johnson</div>
        </div>
        <div className="text-sm text-slate-600">"Let's schedule the product review meeting for next week. Can you follow up with the team?"</div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <SparklesIcon className="h-5 w-5 text-primary" />
        </motion.div>
      </div>

      {/* Generated Task */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Task Auto-Created</span>
        </div>
        <div className="text-sm text-slate-700 font-medium">Schedule product review meeting</div>
        <div className="text-xs text-slate-500 mt-1">Due: Next Tuesday • Priority: High</div>
      </div>
    </div>
  );
}

function SmartSearchDemo() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-700 mb-3">Natural Language Search</div>
      
      {/* Search Input */}
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">"emails about budget from Sarah this month"</span>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Sarah Chen</span>
            <span className="text-xs text-slate-500">• 3 days ago</span>
          </div>
          <div className="text-sm text-slate-600">Q4 Budget Planning Discussion</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Sarah Chen</span>
            <span className="text-xs text-slate-500">• 1 week ago</span>
          </div>
          <div className="text-sm text-slate-600">Budget Approval Request</div>
        </div>
      </div>
    </div>
  );
}

function VoiceControlDemo() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-700 mb-3">Voice Commands</div>
      
      {/* Voice Wave Animation */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ height: ["20px", "40px", "20px"] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="w-1 bg-gradient-to-t from-primary to-teal-500 rounded-full"
              style={{ height: "20px" }}
            />
          ))}
        </div>
        <div className="text-center text-sm text-slate-600">
          "Create a follow-up task for the budget meeting"
        </div>
      </div>

      {/* Command Result */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Voice Command Executed</span>
        </div>
        <div className="text-sm text-slate-700">Task created: "Budget meeting follow-up"</div>
      </div>
    </div>
  );
}

function EmailIntelligenceDemo() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-700 mb-3">AI Email Analysis</div>
      
      {/* Email Categories */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-medium text-green-600 mb-1">ACTION REQUIRED</div>
          <div className="text-sm text-slate-700">12 emails</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-medium text-blue-600 mb-1">FOLLOW-UP</div>
          <div className="text-sm text-slate-700">8 emails</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-medium text-purple-600 mb-1">WAITING ON</div>
          <div className="text-sm text-slate-700">5 emails</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs font-medium text-orange-600 mb-1">FYI</div>
          <div className="text-sm text-slate-700">23 emails</div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <BrainIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">AI INSIGHT</span>
        </div>
        <div className="text-sm text-slate-700">3 high-priority items need immediate attention</div>
      </div>
    </div>
  );
}