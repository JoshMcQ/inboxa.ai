"use client";

import { motion } from "framer-motion";
import { StarIcon, QuoteIcon } from "lucide-react";

const testimonials = [
  {
    content: "InboxaAI reduced my email management time by 80%. The AI actually understands context and creates the exact tasks I need. It's like having a brilliant assistant who never sleeps.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Industries",
    rating: 5,
    avatar: "SC",
    color: "from-purple-500 to-pink-500",
    stats: "Saves 3.2 hours daily"
  },
  {
    content: "The ElevenLabs voice integration is revolutionary. I manage my entire inbox during my commute. The AI drafts responses that sound exactly like my writing style - my team can't tell the difference.",
    author: "Michael Rodriguez", 
    role: "Founder & CEO",
    company: "StartupLab",
    rating: 5,
    avatar: "MR",
    color: "from-blue-500 to-cyan-500",
    stats: "100+ emails processed daily"
  },
  {
    content: "Finally, an inbox that thinks like I do. The automatic follow-up scheduling and task creation eliminated 90% of my manual email processing. It's indispensable.",
    author: "Emily Watson",
    role: "Head of Product",
    company: "InnovateCorp",
    rating: 5,
    avatar: "EW", 
    color: "from-green-500 to-teal-500",
    stats: "Zero missed follow-ups"
  },
  {
    content: "As a busy executive, I thought I'd tried every email tool. InboxaAI is different - it actually learns my preferences and handles my inbox like I would, but faster and more consistently.",
    author: "David Kim",
    role: "Chief Technology Officer",
    company: "CloudScale Systems",
    rating: 5,
    avatar: "DK",
    color: "from-orange-500 to-red-500",
    stats: "95% automation rate"
  },
  {
    content: "The smart categorization and priority detection are spot-on. I've never had such clarity in my inbox. The AI knows what needs immediate attention before I do.",
    author: "Lisa Thompson",
    role: "VP of Operations", 
    company: "Global Dynamics",
    rating: 5,
    avatar: "LT",
    color: "from-indigo-500 to-purple-500",
    stats: "Perfect priority detection"
  },
  {
    content: "InboxaAI transformed our entire team's email workflow. We're responding 300% faster while maintaining quality. The ROI is incredible - paid for itself in the first month.",
    author: "James Wilson",
    role: "Director of Sales",
    company: "Revenue Solutions",
    rating: 5,
    avatar: "JW",
    color: "from-teal-500 to-green-500",
    stats: "300% faster responses"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 mb-6">
            <StarIcon className="h-4 w-4 text-primary mr-2 fill-current" />
            <span className="text-sm font-medium text-primary">4.9/5 Average Rating</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Loved by 10,000+
            <span className="block bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
              Professionals
            </span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of executives, entrepreneurs, and professionals who've transformed their email experience with InboxaAI.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full">
                {/* Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <QuoteIcon className="h-6 w-6 text-primary/60" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground leading-relaxed mb-6 text-lg">
                  "{testimonial.content}"
                </blockquote>

                {/* Stats */}
                <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 mb-6 border border-border/30">
                  <div className="text-sm font-semibold text-primary text-center">
                    {testimonial.stats}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-2xl p-8 border border-primary/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-500 mb-2">2.5M+</div>
              <div className="text-sm text-muted-foreground">Emails Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-500 mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}