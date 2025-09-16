"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon, ArrowRightIcon, SparklesIcon, MailIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import { ReactNode } from "react";

interface HeroHomeProps {
  title?: ReactNode;
  subtitle?: ReactNode;
}

export function HeroHome({ title, subtitle }: HeroHomeProps = {}) {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />
      
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
                  <SparklesIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-slate-200">AI-Powered Email Intelligence</span>
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
                    <span className="block">Your AI Email</span>
                    <span className="block bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                      Command Center
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
                {subtitle || "Transform chaos into clarity. InboxaAI automatically creates tasks, schedules follow-ups, and manages your entire workflow through intelligent conversation."}
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

            {/* Right Column - App Screenshots */}
            <div className="mt-16 lg:mt-0 lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Main App Screenshot */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                    {/* Browser Chrome */}
                    <div className="bg-slate-800 px-4 py-3 flex items-center border-b border-slate-700">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="bg-slate-700 rounded-lg px-3 py-1 inline-block">
                          <span className="text-slate-300 text-sm">inbox.ai/planner</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Interface */}
                    <div className="bg-background p-6">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-teal-500 rounded-lg"></div>
                          <div>
                            <h2 className="text-lg font-semibold text-foreground">Today's AI Tasks</h2>
                            <p className="text-sm text-muted-foreground">6 tasks auto-generated from emails</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-teal-500 text-white">
                          + Auto-create
                        </Button>
                      </div>

                      {/* Task Cards */}
                      <div className="space-y-4">
                        {/* High Priority Task */}
                        <motion.div
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="bg-card border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-card-foreground">High Priority</span>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Due in 2h</span>
                              </div>
                              <h3 className="font-medium text-card-foreground">Follow up: Sarah Chen about Q4 budget approval</h3>
                              <p className="text-sm text-muted-foreground mt-1">Auto-created from: "Re: Q4 Budget Discussion" • 15 min task</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <MailIcon className="w-3 h-3" />
                                <span>Linked to email thread</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700">
                              <CheckCircleIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>

                        {/* Medium Priority Task */}
                        <div className="bg-card border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-card-foreground">Medium Priority</span>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Due in 4h</span>
                              </div>
                              <h3 className="font-medium text-card-foreground">Waiting on: Invoice #2024-001 approval</h3>
                              <p className="text-sm text-muted-foreground mt-1">Auto-created from Finance team • 5 min task</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-teal-600">
                              <ClockIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Scheduled Task */}
                        <div className="bg-card border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-card-foreground">Scheduled</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">6:00 PM</span>
                              </div>
                              <h3 className="font-medium text-card-foreground">Send: Weekly team report</h3>
                              <p className="text-sm text-muted-foreground mt-1">Auto-scheduled by rule R-08 • 30 min task</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Stats */}
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">47</div>
                            <div className="text-xs text-muted-foreground">Tasks Created</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-teal-500">23</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-500">89%</div>
                            <div className="text-xs text-muted-foreground">On Time</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Email Card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -right-4 -top-4 w-64 bg-white rounded-xl shadow-xl border p-4 z-10"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        SC
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Sarah Chen</div>
                        <div className="text-xs text-slate-500">sarah@company.com</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 mb-2 font-medium">Re: Q4 Budget Discussion</div>
                    <div className="text-xs text-slate-600 line-clamp-2">
                      "Can we schedule a follow-up meeting to finalize the budget approval? I need this by Friday..."
                    </div>
                    <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center">
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      AI creating task...
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}
