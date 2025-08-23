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
      <section className="pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Features That Transform Email
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to turn your inbox from a burden into your competitive advantage
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-16 ${categoryIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900">
                {category.title}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {category.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-[#1a365d] bg-opacity-10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-[#1a365d]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-16 bg-[#1a365d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free trial today and see the difference AI can make
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-[#1a365d] bg-white hover:bg-gray-100"
            >
              Start Free Trial
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}