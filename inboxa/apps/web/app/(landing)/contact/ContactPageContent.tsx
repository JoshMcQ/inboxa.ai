"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MailIcon,
  PhoneIcon,
  MessageSquareIcon,
  HeadphonesIcon,
  BugIcon,
  LightbulbIcon,
  BuildingIcon,
  ClockIcon,
  SendIcon
} from "lucide-react";

const contactMethods = [
  {
    icon: MailIcon,
    title: "Email Support",
    description: "Get help with technical issues and account questions",
    contact: "support@inboxa.ai",
    responseTime: "Usually within 4 hours"
  },
  {
    icon: MessageSquareIcon,
    title: "General Inquiries",
    description: "Questions about our product, pricing, or partnerships",
    contact: "hello@inboxa.ai",
    responseTime: "Usually within 24 hours"
  },
  {
    icon: BugIcon,
    title: "Bug Reports",
    description: "Found an issue? Help us make InboxaAI better",
    contact: "bugs@inboxa.ai",
    responseTime: "Usually within 2 hours"
  },
  {
    icon: LightbulbIcon,
    title: "Feature Requests",
    description: "Share your ideas for new features and improvements",
    contact: "feedback@inboxa.ai",
    responseTime: "Usually within 48 hours"
  }
];

const faqs = [
  {
    question: "How quickly can I get started with InboxaAI?",
    answer: "You can start using InboxaAI in under 5 minutes. Simply sign up, connect your email account, and our AI will begin learning your preferences immediately."
  },
  {
    question: "Is my email data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and never store your actual email content. Our AI processes emails in real-time without permanent storage of sensitive data."
  },
  {
    question: "Do you offer enterprise plans?",
    answer: "Yes! We offer custom enterprise solutions with advanced security features, team management, and dedicated support. Contact us to discuss your organization's needs."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees."
  }
];

export function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Thank you! We'll get back to you soon.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
              Get in Touch
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Have questions, feedback, or need support? We're here to help.
              Our team is committed to providing you with the best experience possible.
            </p>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-24">

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <method.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {method.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {method.description}
              </p>
              <a
                href={`mailto:${method.contact}`}
                className="text-primary font-medium hover:text-primary/80 text-sm"
              >
                {method.contact}
              </a>
              <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3 mr-1" />
                {method.responseTime}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg mr-4">
                <SendIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-lg mr-4">
                <MessageSquareIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Office Info */}
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
              <BuildingIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Visit Our Office</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-slate-300 leading-relaxed">
              While we operate remotely, we also have a physical presence in San Francisco.
              Feel free to schedule a visit or coffee chat with our team.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-lg">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">📍</div>
                <div className="text-white font-medium">San Francisco, CA</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🕒</div>
                <div className="text-white font-medium">Monday - Friday<br />9 AM - 6 PM PST</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-white font-medium">
                  <a href="mailto:hello@inboxa.ai" className="underline hover:text-teal-300 transition-colors">
                    hello@inboxa.ai
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}