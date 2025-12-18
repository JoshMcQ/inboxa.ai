"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon, RocketIcon } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-500/20" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-teal-400/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/10 rounded-full blur-xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <RocketIcon className="h-5 w-5 text-white mr-3" />
            <span className="text-white font-medium">Ready to Launch Your Productivity?</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Transform Your Email
            <span className="block bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              In Just 2 Minutes
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-6 text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed"
          >
            Join 10,000+ professionals who've revolutionized their email workflow with AI. 
            Start your free trial and experience the future of inbox management today.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap justify-center gap-6 mb-12"
          >
            {[
              "No credit card required",
              "Setup in 2 minutes", 
              "Cancel anytime",
              "24/7 AI support"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center text-slate-200"
              >
                <CheckCircleIcon className="h-5 w-5 text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-slate-900 font-bold px-10 py-4 text-lg rounded-xl shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 group"
              asChild
            >
              <Link href="/login">
                <SparklesIcon className="mr-3 h-5 w-5" />
                Start Free Trial
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            {/* Demo button removed while no demo is available */}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-slate-400 mb-4">Trusted by professionals at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {[
                "TechFlow", "StartupLab", "InnovateCorp", "CloudScale", "Global Dynamics"
              ].map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10"
                >
                  <span className="text-white/70 font-medium text-sm">{company}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
