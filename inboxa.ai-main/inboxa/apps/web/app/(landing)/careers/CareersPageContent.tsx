"use client";

import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  CodeIcon,
  PaletteIcon,
  TrendingUpIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  RocketIcon
} from "lucide-react";

const benefits = [
  {
    icon: DollarSignIcon,
    title: "Competitive Compensation",
    description: "Market-leading salaries plus equity participation in our growing company"
  },
  {
    icon: ClockIcon,
    title: "Flexible Schedule",
    description: "Work when you're most productive with flexible hours and remote-first culture"
  },
  {
    icon: HeartIcon,
    title: "Health & Wellness",
    description: "Comprehensive health coverage and wellness programs for you and your family"
  },
  {
    icon: RocketIcon,
    title: "Growth Opportunities",
    description: "Continuous learning budget and clear career progression paths"
  }
];

const positions = [
  {
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "Remote / San Francisco",
    type: "Full-time",
    description: "Lead development of our core AI email processing algorithms and natural language understanding systems.",
    requirements: [
      "5+ years experience in machine learning and AI",
      "Strong background in NLP and transformers",
      "Experience with Python, PyTorch/TensorFlow",
      "Previous work on production ML systems"
    ]
  },
  {
    title: "Full Stack Engineer",
    department: "Engineering",
    location: "Remote / San Francisco",
    type: "Full-time",
    description: "Build and scale our web application, API infrastructure, and user-facing features.",
    requirements: [
      "4+ years experience with React/Next.js",
      "Strong backend experience with Node.js/Python",
      "Experience with cloud infrastructure (AWS/GCP)",
      "Understanding of email protocols and APIs"
    ]
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote / San Francisco",
    type: "Full-time",
    description: "Shape the user experience of AI-powered email management tools used by thousands of professionals.",
    requirements: [
      "3+ years product design experience",
      "Strong portfolio of B2B software design",
      "Experience with design systems and user research",
      "Familiarity with AI/ML product design patterns"
    ]
  },
  {
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Remote / San Francisco",
    type: "Full-time",
    description: "Drive user acquisition and revenue growth through data-driven marketing strategies.",
    requirements: [
      "3+ years growth marketing experience",
      "Experience with B2B SaaS marketing",
      "Strong analytical and testing mindset",
      "Knowledge of marketing automation tools"
    ]
  }
];

const values = [
  "Innovation First - We push the boundaries of what's possible with AI",
  "User Obsession - Every decision starts with understanding user needs",
  "Transparency - Open communication and honest feedback",
  "Excellence - We ship quality products that we're proud of",
  "Growth Mindset - Continuous learning and improvement"
];

export function CareersPageContent() {
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
              Build the Future of Email
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join our mission to transform how the world manages email through AI.
              We're looking for passionate individuals who want to solve complex problems
              and make a meaningful impact on productivity worldwide.
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-24">

        {/* Why Join Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 mb-24 shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg mr-4">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Why InboxaAI?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Early Stage Impact</h3>
              <p className="text-gray-600">
                Join us in the early stages and help shape the product, culture, and future of the company.
                Your contributions will have direct impact on our success.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cutting-Edge Technology</h3>
              <p className="text-gray-600">
                Work with the latest AI technologies including large language models, natural language processing,
                and modern web frameworks.
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Values</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {values.map((value, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Benefits & Perks</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe in taking care of our team members with comprehensive benefits and a supportive work environment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Open Positions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join our growing team and help shape the future of AI-powered email management
            </p>
          </div>
          <div className="space-y-6">
            {positions.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        {position.department}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {position.location}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {position.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{position.description}</p>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {position.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button className="w-full lg:w-auto bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Don't See Your Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
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
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Don't See Your Role?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-slate-300 leading-relaxed">
              We're always looking for exceptional talent. If you're passionate about AI
              and productivity, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@inboxa.ai"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Email Us
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Get In Touch
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              We review all applications personally • Fast response time
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}