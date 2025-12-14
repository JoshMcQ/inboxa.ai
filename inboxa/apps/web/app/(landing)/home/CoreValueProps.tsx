"use client";

import { motion } from "framer-motion";
import { BrainIcon, MicIcon, GraduationCapIcon } from "lucide-react";

const valueProps = [
  {
    icon: BrainIcon,
    title: "Email Intelligence",
    description: "Never miss important emails again. Our AI reads every message, extracts key information, and surfaces what matters most.",
  },
  {
    icon: MicIcon,
    title: "Voice-First Productivity",
    description: "Manage emails hands-free. Dictate responses, search conversations, and get briefings while you focus on what matters.",
  },
  {
    icon: GraduationCapIcon,
    title: "Learns Your Style",
    description: "The more you use it, the smarter it gets. InboxaAI learns your communication patterns and handles routine tasks automatically.",
  },
];

export function CoreValueProps() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <prop.icon className="h-8 w-8 text-[#1a365d]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {prop.title}
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}