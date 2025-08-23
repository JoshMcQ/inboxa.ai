"use client";

import { motion } from "framer-motion";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Perfect for individuals getting started with AI email management",
    features: [
      "1 user",
      "1 email account",
      "Basic AI features",
      "Voice commands",
      "Email search",
      "Standard support",
    ],
    notIncluded: [
      "Multiple email accounts",
      "Advanced automation",
      "Custom integrations",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/login",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "per month",
    description: "For professionals who need advanced features and multiple accounts",
    features: [
      "1 user",
      "3 email accounts",
      "Advanced AI features",
      "Custom automation rules",
      "Priority support",
      "API access",
      "Advanced analytics",
      "Custom email templates",
    ],
    notIncluded: [
      "Unlimited users",
      "Enterprise security",
      "Dedicated success manager",
    ],
    cta: "Start Free Trial",
    ctaLink: "/login",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "For teams that need advanced security, control, and support",
    features: [
      "Unlimited users",
      "Unlimited email accounts",
      "Advanced security features",
      "SSO & SAML integration",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantee",
      "On-premise deployment option",
      "Custom AI training",
      "Admin dashboard",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    ctaLink: "/enterprise",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I try InboxaAI before committing?",
    answer: "Yes! We offer a 14-day free trial for all plans. No credit card required to start.",
  },
  {
    question: "What happens to my emails if I cancel?",
    answer: "Your emails remain in your Gmail account. InboxaAI never stores your actual emails - we only process them to provide our services.",
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes, we offer 20% off when you pay annually. Contact our sales team for more information.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use bank-level encryption, are SOC 2 compliant, and your data is isolated and encrypted at rest.",
  },
  {
    question: "What email providers do you support?",
    answer: "Currently, we support Gmail and Google Workspace accounts. Support for Outlook is coming soon.",
  },
];

export function PricingPageContent() {
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
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-lg ${
                  plan.highlighted
                    ? "ring-2 ring-[#1a365d] shadow-xl"
                    : "border border-gray-200"
                } bg-white p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#1a365d] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-gray-600">{plan.description}</p>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 mt-6 pt-6">
                        <ul className="space-y-3">
                          {plan.notIncluded.map((feature) => (
                            <li key={feature} className="flex items-start">
                              <XIcon className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                              <span className="text-gray-400 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8">
                  <Link
                    href={plan.ctaLink}
                    className={`block w-full text-center px-6 py-3 rounded-md font-medium ${
                      plan.highlighted
                        ? "bg-[#1a365d] text-white hover:bg-[#2c5282]"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Ready to Transform Your Email?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-[#1a365d] bg-white hover:bg-gray-100"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}