"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export function CTA() {
  return (
    <section className="py-16 bg-[#1a365d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Email?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of professionals who've reclaimed their time with InboxaAI. 
            Start your free trial today - no credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#1a365d] hover:bg-gray-100 font-semibold px-8 py-3"
              asChild
            >
              <Link href="/login">
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3"
              asChild
            >
              <Link href="/enterprise">
                Contact Sales
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            Free trial • No credit card required • Enterprise plans available
          </p>
        </motion.div>
      </div>
    </section>
  );
}
