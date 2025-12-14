"use client";

import { motion } from "framer-motion";
import {
  HeartIcon,
  RocketIcon,
  UsersIcon,
  GlobeIcon,
  BrainIcon,
  ShieldCheckIcon
} from "lucide-react";

const values = [
  {
    icon: BrainIcon,
    title: "AI-First Innovation",
    description: "We believe artificial intelligence should enhance human productivity, not replace human judgment."
  },
  {
    icon: ShieldCheckIcon,
    title: "Privacy & Security",
    description: "Your email data is yours. We implement industry-leading security practices to protect your privacy."
  },
  {
    icon: UsersIcon,
    title: "User-Centric Design",
    description: "Every feature we build is designed with real user needs and workflows in mind."
  },
  {
    icon: GlobeIcon,
    title: "Accessible Technology",
    description: "We're making advanced AI email management accessible to professionals worldwide."
  }
];

const team = [
  {
    name: "Engineering Team",
    role: "Building the Future of Email",
    description: "Our team of AI engineers and email specialists work tirelessly to create intuitive, powerful tools."
  },
  {
    name: "Research Team",
    role: "Advancing AI Understanding",
    description: "Dedicated to improving natural language processing and email comprehension capabilities."
  },
  {
    name: "Design Team",
    role: "Crafting User Experience",
    description: "Focused on making complex AI features simple and delightful to use."
  }
];

export function AboutPageContent() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden pt-24 pb-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6">
              Transforming Email Management with AI
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              InboxaAI was born from a simple belief: email should work for you, not against you.
              We're building the future of intelligent email management, powered by cutting-edge AI
              that understands context, learns from your behavior, and amplifies your productivity.
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-24">

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 mb-24 shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg mr-4">
              <RocketIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed">
            To eliminate email overwhelm and transform inboxes from sources of stress into
            powerful productivity engines. We envision a world where AI handles the mundane
            aspects of email management, allowing humans to focus on what matters most:
            meaningful communication and strategic work.
          </p>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we build and every decision we make
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg mr-4 flex-shrink-0">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Passionate experts working together to revolutionize email management
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Join Team CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Want to Join Our Team?
              </h3>
              <p className="text-gray-600 mb-6">
                We're always looking for talented individuals who share our vision
              </p>
              <a
                href="/careers"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                View Open Positions
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-12 text-center text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />

          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Join Our Journey</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-slate-300 leading-relaxed">
              We're just getting started. Help us build the future of email management
              and reclaim your productivity today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Get In Touch
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              No credit card required • Setup in 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}