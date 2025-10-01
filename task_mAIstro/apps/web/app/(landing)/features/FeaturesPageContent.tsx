"use client";

import { motion } from "framer-motion";
import { 
  MicIcon, 
  SearchIcon, 
  PenToolIcon, 
  ClipboardListIcon, 
  BarChart3Icon, 
  ShieldCheckIcon,
  BrainIcon,
  ZapIcon,
  UsersIcon,
  GlobeIcon,
  LockIcon,
  HeadphonesIcon
} from "lucide-react";

const featureCategories = [
  {
    title: "AI Email Intelligence",
    description: "Advanced AI capabilities that understand and manage your email",
    features: [
      {
        icon: SearchIcon,
        title: "Semantic Search",
        description: "Find any email by describing what you remember, not exact keywords"
      },
      {
        icon: BrainIcon,
        title: "Automatic Summarization",
        description: "Get instant summaries of long email threads and attachments"
      },
      {
        icon: BarChart3Icon,
        title: "Priority Scoring",
        description: "AI ranks emails by importance based on your behavior patterns"
      },
      {
        icon: UsersIcon,
        title: "Contact Insights",
        description: "Understand relationship history and communication patterns"
      }
    ]
  },
  {
    title: "Voice-Powered Productivity",
    description: "Hands-free email management for the modern professional",
    features: [
      {
        icon: MicIcon,
        title: "Natural Voice Commands",
        description: "Manage emails while driving, cooking, or multitasking"
      },
      {
        icon: HeadphonesIcon,
        title: "Audio Briefings",
        description: "Listen to email summaries and daily digests"
      },
      {
        icon: PenToolIcon,
        title: "Voice Dictation",
        description: "Compose and reply to emails using natural speech"
      },
      {
        icon: SearchIcon,
        title: "Voice Search",
        description: "Find emails by speaking natural queries"
      }
    ]
  },
  {
    title: "Smart Automation",
    description: "Let AI handle the repetitive tasks while you focus on what matters",
    features: [
      {
        icon: ClipboardListIcon,
        title: "Task Extraction",
        description: "Automatically create tasks and reminders from email content"
      },
      {
        icon: ZapIcon,
        title: "Workflow Rules",
        description: "Set up custom automation based on sender, content, or patterns"
      },
      {
        icon: PenToolIcon,
        title: "Response Templates",
        description: "AI learns and suggests responses based on your writing style"
      },
      {
        icon: GlobeIcon,
        title: "Calendar Integration",
        description: "Automatically schedule meetings and sync with your calendar"
      }
    ]
  },
  {
    title: "Enterprise Security",
    description: "Bank-level security with compliance certifications",
    features: [
      {
        icon: LockIcon,
        title: "End-to-End Encryption",
        description: "Your data is encrypted at rest and in transit"
      },
      {
        icon: ShieldCheckIcon,
        title: "SOC 2 Compliance",
        description: "Audited security practices and procedures"
      },
      {
        icon: UsersIcon,
        title: "SSO & SAML",
        description: "Enterprise single sign-on integration"
      },
      {
        icon: BarChart3Icon,
        title: "Admin Analytics",
        description: "Detailed usage and security analytics for admins"
      }
    ]
  }
];

export function FeaturesPageContent() {
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
              Features That Transform Email
            </h1>
            <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to turn your inbox from a burden into your competitive advantage
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-24 ${categoryIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900">
                {category.title}
              </h2>
              <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
                {category.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {category.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg">
                        <feature.icon className="h-6 w-6 text-[#1a365d]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mid-section CTA for every other category */}
            {categoryIndex % 2 === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-primary/5 to-teal-500/5 rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ready to Experience {category.title}?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    See how these features work together to transform your email workflow
                  </p>
                  <a
                    href="/login"
                    className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Try It Free
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      ))}

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
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Start your free trial today and see the difference AI can make for your email productivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Learn How It Works
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              No credit card required • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}