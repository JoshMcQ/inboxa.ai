"use client";

import { motion } from "framer-motion";
import {
  LinkIcon,
  SparklesIcon,
  MicIcon,
  MailIcon,
  SearchIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "1",
    title: "Connect Gmail Securely",
    description: "OAuth takes under a minute. Safe-Send guardrails and encryption keep tokens locked down.",
    icon: LinkIcon,
    color: "from-blue-500 to-cyan-500",
    demo: "connect"
  },
  {
    number: "2",
    title: "ElevenLabs Voice Widget",
    description: "Talk naturally through the floating voice orb - 'Read today's important emails' or 'Archive promos older than 30 days.' The orchestrator handles confirmations and undo windows.",
    icon: MicIcon,
    color: "from-violet-500 to-purple-500",
    demo: "orchestrator"
  },
  {
    number: "3",
    title: "Agents Find & Summarize",
    description: "Specialized agents search threads, pull attachments, and deliver TL;DRs, action items, and key numbers.",
    icon: SearchIcon,
    color: "from-teal-500 to-cyan-500",
    demo: "agents"
  },
  {
    number: "4",
    title: "Stay in Control",
    description: "Safe-Send reads back recipients, follow-ups catch slipped threads, and digests recap what changed overnight.",
    icon: CheckCircleIcon,
    color: "from-amber-500 to-orange-500",
    demo: "control"
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
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            How InboxaAI
            <span className="block bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              Transforms Your Email
            </span>
          </h2>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">
            From setup to productivity in under five minutes. InboxaAI walks you through each step and keeps you in control the entire time.
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
                className="relative group h-full"
              >
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col gap-5 h-full text-left">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} text-white font-bold text-xl shadow-lg self-start`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div>
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-2xl font-semibold text-slate-900 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Demo */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    {step.demo === "connect" && <ConnectDemo />}
                    {step.demo === "orchestrator" && <OrchestratorDemo />}
                    {step.demo === "agents" && <AgentsDemo />}
                    {step.demo === "control" && <ControlDemo />}
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
            No credit card required - Setup takes 2 minutes
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

function OrchestratorDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">ElevenLabs widget</div>
      <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MicIcon className="w-3.5 h-3.5 text-primary" />
          <span>Listening...</span>
        </div>
        <div className="text-sm text-slate-700 font-medium">"Read today's important emails and unsubscribe from CalmCo."</div>
      </div>
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-2 space-y-1">
        <div className="text-xs font-semibold text-violet-700">Orchestrator Plan</div>
        <div className="text-xs text-slate-600">- Route to Summaries agent</div>
        <div className="text-xs text-slate-600">- Confirm unsubscribe with safety checks</div>
        <div className="text-xs text-slate-600">- Offer undo after actions run</div>
      </div>
    </div>
  );
}

function AgentsDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">Agent responses</div>
      <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-3">
        <div>
          <div className="text-xs font-semibold text-primary">Search</div>
          <div className="text-sm text-slate-700">Found the PDF Legal sent last Thursday.</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-primary">Summaries</div>
          <div className="text-sm text-slate-700">TL;DR: Wire is approved; action item - confirm by Friday.</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-primary">Numbers & Dates</div>
          <div className="text-sm text-slate-700">Amount: $12,500 - Deadline: Fri, 3 PM.</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <SparklesIcon className="w-3.5 h-3.5 text-teal-500" />
        <span>Agents share context automatically.</span>
      </div>
    </div>
  );
}

function ControlDemo() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700 mb-2">Safety & follow-up</div>
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Safe-Send check</span>
            <span className="text-emerald-500">Pass</span>
          </div>
          <div className="text-sm text-slate-700">Recipients confirmed - attachment verified.</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-green-700">Reminder armed</div>
          <div className="text-sm text-slate-700">Ping me if Legal hasn't replied by 3 PM tomorrow.</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-amber-700">Daily digest</div>
          <div className="text-sm text-slate-700">3 urgent threads - 2 suggested cleanups.</div>
        </div>
      </div>
    </div>
  );
}
