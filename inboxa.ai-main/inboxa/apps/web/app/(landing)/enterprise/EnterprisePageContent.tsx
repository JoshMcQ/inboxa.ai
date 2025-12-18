"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheckIcon,
  UsersIcon,
  BarChart3Icon,
  LockIcon,
  GlobeIcon,
  HeadphonesIcon,
  CheckCircleIcon,
  BuildingIcon,
  KeyIcon,
  ClipboardCheckIcon
} from "lucide-react";
import Link from "next/link";

const enterpriseFeatures = [
  {
    icon: ShieldCheckIcon,
    title: "Enterprise-Grade Security",
    description: "SOC 2 Type II certified with bank-level encryption, SSO/SAML support, and comprehensive audit logs",
  },
  {
    icon: UsersIcon,
    title: "Unlimited Users & Accounts",
    description: "Scale across your entire organization with centralized billing and user management",
  },
  {
    icon: BarChart3Icon,
    title: "Advanced Analytics",
    description: "Detailed insights into email patterns, productivity metrics, and ROI tracking",
  },
  {
    icon: LockIcon,
    title: "Data Isolation & Control",
    description: "Your data is completely isolated with options for on-premise deployment",
  },
  {
    icon: GlobeIcon,
    title: "Custom Integrations",
    description: "API access and custom integrations with your existing tools and workflows",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "24/7 priority support with a dedicated customer success manager",
  },
];

const complianceItems = [
  "SOC 2 Type II Certified",
  "GDPR Compliant",
  "HIPAA Compliant",
  "ISO 27001 Certified",
  "End-to-End Encryption",
  "Regular Security Audits",
];

const implementationSteps = [
  {
    title: "Discovery Call",
    description: "Understand your needs and customize the solution",
    timeline: "Day 1",
  },
  {
    title: "Pilot Program",
    description: "Start with a small team to prove value",
    timeline: "Week 1-2",
  },
  {
    title: "Full Deployment",
    description: "Roll out to entire organization with training",
    timeline: "Week 3-4",
  },
  {
    title: "Ongoing Success",
    description: "Regular check-ins and optimization",
    timeline: "Ongoing",
  },
];

const caseStudyMetrics = [
  { metric: "2.5 hours", description: "Saved per employee daily" },
  { metric: "87%", description: "Reduction in email response time" },
  { metric: "94%", description: "User satisfaction rate" },
  { metric: "3.2x", description: "ROI in first year" },
];

export function EnterprisePageContent() {
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
              Built for Scale, Security, and Control
            </h1>
            <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
              Transform email for your entire organization with enterprise-grade security,
              compliance, and dedicated support.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Request Demo
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                View Security Details
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Enterprise Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to deploy InboxaAI across your organization
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-[#1a365d] bg-opacity-10 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-[#1a365d]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Security & Compliance
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                InboxaAI meets the highest standards for security and compliance, 
                ensuring your data is protected at every level.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {complianceItems.map((item) => (
                  <div key={item} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <BuildingIcon className="h-12 w-12 text-[#1a365d] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <KeyIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">Centralized user management</span>
                </li>
                <li className="flex items-start">
                  <BarChart3Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">Usage analytics and reporting</span>
                </li>
                <li className="flex items-start">
                  <ClipboardCheckIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">Compliance monitoring</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">Security audit logs</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Fast, Smooth Implementation
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get your team up and running in weeks, not months
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {implementationSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-[#1a365d] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <p className="text-sm font-medium text-[#1a365d]">{step.timeline}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Metrics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Proven Results
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See the impact InboxaAI has on enterprise teams
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {caseStudyMetrics.map((item, index) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#1a365d] mb-2">
                  {item.metric}
                </div>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Email for Your Organization?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Let's discuss how InboxaAI can help your team save time and work smarter
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Request Demo
              </Link>
              <Link
                href="/roi-calculator"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Calculate Your ROI
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}