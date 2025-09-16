"use client";

import { motion } from "framer-motion";
import { LinkIcon, BrainIcon, MessageSquareIcon, CheckCircleIcon, MailIcon, SparklesIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "1",
    title: "Connect Your Gmail",
    description: "Secure OAuth integration that takes just 30 seconds. Your data stays private and encrypted.",
    icon: LinkIcon,
    color: "from-blue-500 to-cyan-500",
    demo: "connect"
  },
  {
    number: "2", 
    title: "AI Learns Your Patterns",
    description: "Our AI analyzes your email behavior to understand priorities, contacts, and workflows.",
    icon: BrainIcon,
    color: "from-purple-500 to-pink-500",
    demo: "learning"
  },
  {
    number: "3",
    title: "Natural Conversations",
    description: "Chat with your inbox using plain English. Ask questions, create tasks, schedule meetings.",
    icon: MessageSquareIcon,
    color: "from-green-500 to-teal-500",
    demo: "chat"
  },
  {
    number: "4",
    title: "Automated Workflows",
    description: "Tasks auto-created, emails categorized, follow-ups scheduled. Your productivity multiplied.",
    icon: CheckCircleIcon,
    color: "from-orange-500 to-red-500",
    demo: "automation"
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 mb-6">
            <SparklesIcon className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Setup in Minutes</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            How InboxaAI 
            <span className="block bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              Transforms Your Email
            </span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            From setup to productivity in under 5 minutes. Watch your email chaos become organized clarity.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 z-0">
            <div className="flex items-center justify-between px-32">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="h-px bg-gradient-to-r from-primary/30 to-teal-500/30 flex-1 mx-8"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 text-center">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} text-white font-bold text-xl mb-6 shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6">
                    <step.icon className="h-8 w-8 text-primary mx-auto" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Demo */}
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-border/50">
                    {step.demo === "connect" && <ConnectDemo />}
                    {step.demo === "learning" && <LearningDemo />}
                    {step.demo === "chat" && <ChatDemo />}
                    {step.demo === "automation" && <AutomationDemo />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            asChild
          >
            <a href="/login">
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • Setup takes 2 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ConnectDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">Gmail OAuth Flow</div>
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded flex items-center justify-center">
            <MailIcon className="w-3 h-3 text-white" />
          </div>
          <div className="text-sm text-slate-700">inbox.ai wants to access Gmail</div>
        </div>
      </div>
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-green-50 border border-green-200 rounded-lg p-2 text-center"
      >
        <div className="text-xs font-medium text-green-700">✓ Connected Securely</div>
      </motion.div>
    </div>
  );
}

function LearningDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">AI Analysis Progress</div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Email patterns</span>
          <span className="text-purple-600">100%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Contact relationships</span>
          <span className="text-purple-600">87%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full w-[87%]" />
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
        <div className="text-xs font-medium text-purple-700">Learning your workflow...</div>
      </div>
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">Natural Language Interface</div>
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="text-sm text-slate-700">"Show me emails from Sarah about the budget"</div>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="text-xs font-medium text-primary mb-1">InboxaAI</div>
        <div className="text-sm text-slate-700">Found 3 emails about budget from Sarah Chen in the last month.</div>
      </div>
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    </div>
  );
}

function AutomationDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">Automated Task Creation</div>
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-green-50 border-l-2 border-green-500 rounded p-2"
        >
          <div className="text-xs font-medium text-green-700">✓ Follow-up created</div>
          <div className="text-xs text-slate-600">Sarah budget meeting</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="bg-blue-50 border-l-2 border-blue-500 rounded p-2"
        >
          <div className="text-xs font-medium text-blue-700">✓ Meeting scheduled</div>
          <div className="text-xs text-slate-600">Team sync - Friday 2PM</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-orange-50 border-l-2 border-orange-500 rounded p-2"
        >
          <div className="text-xs font-medium text-orange-700">✓ Reminder set</div>
          <div className="text-xs text-slate-600">Invoice due tomorrow</div>
        </motion.div>
      </div>
    </div>
  );
}