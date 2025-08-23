"use client";

import { motion } from "framer-motion";
import { LinkIcon, BrainIcon, MessageSquareIcon, CheckCircleIcon } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Connect Gmail",
    description: "Simple OAuth flow to securely connect your Gmail account",
    icon: LinkIcon,
  },
  {
    number: "2",
    title: "AI Reads Everything",
    description: "Our AI processes and understands your email patterns",
    icon: BrainIcon,
  },
  {
    number: "3",
    title: "Talk to Your Inbox",
    description: "Use natural language to manage emails through chat",
    icon: MessageSquareIcon,
  },
  {
    number: "4",
    title: "Get Work Done",
    description: "Save hours daily with automated email management",
    icon: CheckCircleIcon,
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started in minutes, not hours
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[#1a365d] text-white rounded-full mb-4">
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
                <div className="mb-4">
                  <step.icon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full">
                  <div className="flex items-center">
                    <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}