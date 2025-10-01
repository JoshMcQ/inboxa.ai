"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MicIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import { ReactNode, useEffect } from "react";
import Script from "next/script";

interface HeroHomeProps {
  title?: ReactNode;
  subtitle?: ReactNode;
}

// Real ElevenLabs Widget Component
function ElevenLabsWidget() {
  useEffect(() => {
    const ensureExpanded = () => {
      const host = document.querySelector<HTMLElement>(".hero-elevenlabs-widget elevenlabs-convai");
      if (!host) {
        return false;
      }

      host.setAttribute("always-expanded", "true");
      host.setAttribute("default-expanded", "true");
      host.setAttribute("show-avatar-when-collapsed", "false");

      const shadow = (host as any).shadowRoot as ShadowRoot | null;
      const overlay = shadow?.querySelector<HTMLElement>(".overlay");
      if (overlay) {
        overlay.style.display = "flex";
        overlay.style.height = "auto";
      }

      const panel = shadow?.querySelector<HTMLElement>(".overlay > div");
      if (panel) {
        panel.style.maxHeight = "550px";
      }

      return !!overlay;
    };

    const id = window.setInterval(() => {
      if (ensureExpanded()) {
        window.clearInterval(id);
      }
    }, 250);

    ensureExpanded();

    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <style jsx global>{`
        .hero-elevenlabs-widget elevenlabs-convai {
          position: static !important;
          inset: auto !important;
          transform: none !important;
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 320px;
          height: auto;
          min-height: 520px;
        }
      `}</style>
      <div className="hero-elevenlabs-widget flex justify-center">
        <div className="w-full max-w-md">
          <elevenlabs-convai
            agent-id="agent_4401k5qqt805f9391dnee7nrbm64"
            variant="full"
            placement="top-right"
            always-expanded="true"
            default-expanded="true"
            show-avatar-when-collapsed="false"
          ></elevenlabs-convai>
        </div>
      </div>
    </>
  );
}


export function HeroHome({ title, subtitle }: HeroHomeProps = {}) {
  return (
    <>
      {/* ElevenLabs Widget Script */}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
        async
        type="text/javascript"
      />

      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left Column - Content */}
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 mb-8">
                    <MicIcon className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium text-slate-200">World's First Voice-AI Email Assistant</span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                  {title || (
                    <>
                      <span className="block">Manage Email With</span>
                      <span className="block bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                        Your Voice
                      </span>
                    </>
                  )}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-6 text-xl text-slate-300 sm:text-2xl max-w-3xl"
                >
                  {subtitle ||
                    "Revolutionary voice AI that lets you manage your entire inbox hands-free. Dictate replies while driving, get email briefings while cooking, and never touch your keyboard again."}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    asChild
                  >
                    <Link href="/login">
                      Start Free Trial
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  {/* Demo button removed while no demo is available */}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 flex items-center justify-center lg:justify-start text-slate-400 text-sm"
                >
                  <CheckCircleIcon className="h-4 w-4 text-teal-400 mr-2" />
                  <span>No credit card required</span>
                  <span className="mx-3">•</span>
                  <CheckCircleIcon className="h-4 w-4 text-teal-400 mr-2" />
                  <span>Setup in 2 minutes</span>
                </motion.div>
              </div>

              {/* Right Column - Voice AI Interface */}
              <div className="mt-16 lg:mt-0 lg:col-span-6">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative flex justify-center">
                    <ElevenLabsWidget />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    </>
  );
}
