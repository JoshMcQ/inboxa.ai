"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon, ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

interface HeroHomeProps {
  title?: ReactNode;
  subtitle?: ReactNode;
}

export function HeroHome({ title, subtitle }: HeroHomeProps = {}) {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              >
                {title || (
                  <>
                    <span className="block text-[#1a365d]">The AI Email Assistant</span>
                    <span className="block text-[#1a365d]">That Actually Works</span>
                  </>
                )}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
              >
                {subtitle || "Stop drowning in emails. InboxaAI reads, understands, and manages your entire inbox through natural conversation."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="rounded-md shadow">
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-[#1a365d] hover:bg-[#2c5282] md:py-4 md:text-lg md:px-10"
                    asChild
                  >
                    <Link href="/login">
                      Start Free Trial
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-[#1a365d] bg-white hover:bg-gray-50 border-gray-300 md:py-4 md:text-lg md:px-10"
                    asChild
                  >
                    <Link href="#demo">
                      <PlayCircleIcon className="mr-2 h-5 w-5" />
                      Watch 2-min Demo
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-gray-50 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
          <div className="p-8 text-center">
            <p className="text-gray-500">Clean mockup of the chat interface showing actual email conversations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
