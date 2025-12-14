"use client";

import { motion } from "framer-motion";
import { TrophyIcon, UsersIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";

const companies = [
  "TechFlow Industries", "StartupLab", "InnovateCorp", "CloudScale Systems", 
  "Global Dynamics", "Revenue Solutions", "DataStream Inc", "NextGen Labs"
];

const achievements = [
  { 
    icon: UsersIcon, 
    value: "10,000+", 
    label: "Active Users",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: ZapIcon, 
    value: "2.5M+", 
    label: "Emails Processed",
    color: "from-green-500 to-teal-500"
  },
  { 
    icon: TrophyIcon, 
    value: "4.9/5", 
    label: "Average Rating",
    color: "from-yellow-500 to-orange-500"
  },
  { 
    icon: ShieldCheckIcon, 
    value: "99.9%", 
    label: "Uptime Guarantee",
    color: "from-purple-500 to-pink-500"
  }
];

export function SocialProof() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-gradient-to-r from-primary/5 to-teal-500/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-muted-foreground font-medium mb-8">
            Trusted by professionals at leading companies
          </p>
          
          {/* Company Names */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {companies.map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/50 hover:border-primary/20 transition-all duration-300"
              >
                <div className="text-muted-foreground font-medium text-sm">
                  {company}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-center">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${achievement.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <achievement.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Value */}
                  <div className={`text-3xl font-bold bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent mb-2`}>
                    {achievement.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-muted-foreground text-sm font-medium">
                    {achievement.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}