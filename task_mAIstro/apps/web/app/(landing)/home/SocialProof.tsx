"use client";

import { motion } from "framer-motion";

const companies = [
  { name: "Google", logo: "Google" },
  { name: "Microsoft", logo: "Microsoft" },
  { name: "Amazon", logo: "Amazon" },
  { name: "Meta", logo: "Meta" },
  { name: "Apple", logo: "Apple" },
  { name: "Netflix", logo: "Netflix" },
];

const stats = [
  { label: "500+ hours saved weekly", value: "500+" },
  { label: "99.9% uptime", value: "99.9%" },
  { label: "Enterprise-grade security", value: "Enterprise" },
];

export function SocialProof() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-base text-gray-600 font-medium mb-8">Trusted by teams at</p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center mb-12">
            {companies.map((company) => (
              <div key={company.name} className="flex justify-center">
                <div className="text-gray-400 text-lg font-semibold">
                  {company.logo}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#1a365d]">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}