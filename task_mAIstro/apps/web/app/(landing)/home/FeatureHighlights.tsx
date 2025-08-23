"use client";

import { motion } from "framer-motion";
import { SearchIcon, PenToolIcon, CalendarIcon, ShieldCheckIcon } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Search Like You Think",
    description: "Find any email instantly using natural language. No more hunting through folders or remembering exact keywords.",
    icon: SearchIcon,
    image: "/search-demo.png",
  },
  {
    title: "Draft in Your Voice",
    description: "AI composes responses that sound like you. It learns your writing style and maintains your professional tone.",
    icon: PenToolIcon,
    image: "/draft-demo.png",
  },
  {
    title: "Never Forget Follow-ups",
    description: "Automatic task creation from email conversations. Stay on top of commitments without manual tracking.",
    icon: CalendarIcon,
    image: "/followup-demo.png",
  },
  {
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC 2 compliance, and isolated data storage. Your emails are safer than ever.",
    icon: ShieldCheckIcon,
    image: "/security-demo.png",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Features That Transform Email
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful capabilities that save hours every week
          </p>
        </motion.div>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg mr-3">
                    <feature.icon className="h-6 w-6 text-[#1a365d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Screenshot: {feature.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}