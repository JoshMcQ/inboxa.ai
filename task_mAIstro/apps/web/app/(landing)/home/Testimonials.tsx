"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    content: "InboxaAI saved me 2 hours daily. I can now manage my entire inbox through voice commands while commuting.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechCorp",
    image: "/testimonial-1.jpg",
  },
  {
    content: "The AI understands context better than any tool I've used. It drafts replies that actually sound like me.",
    author: "Michael Rodriguez",
    role: "CEO",
    company: "StartupHub",
    image: "/testimonial-2.jpg",
  },
  {
    content: "Finally, an inbox that thinks like I do. The automatic task creation from emails is a game-changer.",
    author: "Emily Watson",
    role: "Product Manager",
    company: "InnovateCo",
    image: "/testimonial-3.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by Professionals
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See how InboxaAI transforms email for busy professionals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="mb-4">
                <svg
                  className="h-8 w-8 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
