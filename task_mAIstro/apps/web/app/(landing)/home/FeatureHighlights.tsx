"use client";

import { motion } from "framer-motion";
import {
  MicIcon,
  SearchIcon,
  FileTextIcon,
  PenToolIcon,
  SparklesIcon,
  BellIcon,
  CheckCircleIcon
} from "lucide-react";

const features = [
  {
    title: "AI Orchestrator",
    description:
      "Interact with your inbox through the ElevenLabs voice widget. The orchestrator routes intents to the right agent, confirms anything risky, and keeps short-term context so you can reference \"that last PDF\" or \"the second email.\"",
    icon: MicIcon,
    color: "from-primary to-teal-500",
    bullets: [
      "Natural conversation through ElevenLabs widget",
      "Confirms destructive actions and offers an undo window",
      "Lists what will happen before anything is sent or deleted"
    ],
    example: "Archive promos older than 30 days and read the latest from Sarah."
  },
  {
    title: "Search & Retrieve",
    description:
      "Find anything in seconds. Ask for people, topics, attachments, or time windows without remembering exact keywords.",
    icon: SearchIcon,
    color: "from-sky-500 to-indigo-500",
    bullets: [
      "Understands fuzzy phrasing like 'the redlines from Legal'",
      "Surfaces attachments, invoices, and threads with previews",
      "Works with the ElevenLabs widget - no clicking through folders"
    ],
    example: "Find the PDF Legal sent last week."
  },
  {
    title: "Summaries & Extraction",
    description:
      "Skip the wall of text. InboxaAI delivers TL;DRs, action items, dates, and numbers in whichever mode you need.",
    icon: FileTextIcon,
    color: "from-emerald-500 to-green-600",
    bullets: [
      "Switch between TL;DR, action-only, or numbers & dates",
      "Grabs owners, deadlines, and follow-ups automatically",
      "Always up to date with the latest reply in long threads"
    ],
    example: "Give me just the action items from the product launch thread."
  },
  {
    title: "Compose & Safe-Send",
    description:
      "Draft replies in your voice with the industry's safest send flow. Every message gets a read-back and guardrails before it leaves your outbox.",
    icon: PenToolIcon,
    color: "from-rose-500 to-amber-500",
    bullets: [
      "Reads back recipients, subject, and length before sending",
      "Catches missing attachments, secrets, and risky commitments",
      "Includes a quiet-hour scheduler plus a 10-second undo"
    ],
    example: "Reply all 'Approved - wire $12,500 by Friday.'"
  },
  {
    title: "Clean & Unsubscribe",
    description:
      "Keep inbox clutter under control with safety-first automations that never click sketchy links.",
    icon: SparklesIcon,
    color: "from-violet-500 to-purple-500",
    bullets: [
      "Authenticates unsubscribe flows or falls back to filters",
      "Bulk cleanup shows preview counts before anything moves",
      "Auto-tags newsletters, receipts, promos, travel, and VIPs"
    ],
    example: "Unsubscribe from anything I haven't opened in 90 days."
  },
  {
    title: "Follow-Ups & Memory",
    description:
      "InboxaAI tracks commitments so nothing slips. It remembers VIPs, templates, tone, and your preferred defaults.",
    icon: BellIcon,
    color: "from-cyan-500 to-sky-500",
    bullets: [
      "Create reminders when replies don't arrive on time",
      "Store reusable phrasing, signatures, and templates",
      "Personalizes summaries and actions based on your habits"
    ],
    example: "Remind me tomorrow if Legal hasn't replied."
  }
];

export function FeatureHighlights() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-primary/10 rounded-full blur-3xl" />
      </div>

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
            <span className="text-sm font-medium text-primary">Purpose-built agents working together</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Features That Transform
            <span className="block bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              How You Work
            </span>
          </h2>
          <p className="mt-6 text-xl text-slate-600 max-w-4xl mx-auto">
            Each InboxaAI agent owns a user outcome - from safe sending to bulk cleanup. Together they deliver a voice-first inbox that is fast, accurate, and trustworthy.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full p-8"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-md`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-slate-600">
                {feature.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {feature.example && (
                <div className="mt-6 bg-teal-50 border border-teal-100 text-teal-900 text-sm rounded-lg px-4 py-3">
                  <span className="font-medium text-teal-900">Try saying:</span> "{feature.example}"
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
