"use client";

import { motion } from "framer-motion";
import { 
  MicIcon, 
  SearchIcon, 
  PenToolIcon, 
  ClipboardListIcon, 
  BarChart3Icon, 
  ShieldCheckIcon,
  UsersIcon,
  BriefcaseIcon,
  HomeIcon,
  ZapIcon
} from "lucide-react";

export function FeaturesHome() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Key Features
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Everything you need to revolutionize your email workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MicIcon className="h-8 w-8" />}
            title="Voice-First Interface"
            description="Manage emails hands-free while driving, cooking, or multitasking"
            delay={0.1}
          />
          <FeatureCard
            icon={<SearchIcon className="h-8 w-8" />}
            title="Intelligent Search"
            description="Find any email by describing what you remember, not exact keywords"
            delay={0.2}
          />
          <FeatureCard
            icon={<PenToolIcon className="h-8 w-8" />}
            title="Smart Composition"
            description="AI drafts emails in your voice and style, learns from your corrections"
            delay={0.3}
          />
          <FeatureCard
            icon={<ClipboardListIcon className="h-8 w-8" />}
            title="Automatic Task Creation"
            description="Emails become actionable items with deadlines and next steps"
            delay={0.4}
          />
          <FeatureCard
            icon={<BarChart3Icon className="h-8 w-8" />}
            title="Inbox Intelligence"
            description="Daily briefings, priority scoring, and conversation insights"
            delay={0.5}
          />
          <FeatureCard
            icon={<ShieldCheckIcon className="h-8 w-8" />}
            title="Enterprise Security"
            description="Bank-level encryption with isolated, per-user data storage"
            delay={0.6}
          />
        </div>

        {/* Perfect For Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Perfect For
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PersonaCard
              icon={<BriefcaseIcon className="h-6 w-6" />}
              title="Executives"
              description="Stay on top of high email volumes"
            />
            <PersonaCard
              icon={<UsersIcon className="h-6 w-6" />}
              title="Sales Teams"
              description="Managing client communications and follow-ups"
            />
            <PersonaCard
              icon={<HomeIcon className="h-6 w-6" />}
              title="Remote Workers"
              description="Who live in their inbox"
            />
            <PersonaCard
              icon={<ZapIcon className="h-6 w-6" />}
              title="Anyone"
              description="Who wants their email to work smarter, not harder"
            />
          </div>
        </motion.div>

        {/* Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-8">
            Seamless Integration
          </h3>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <IntegrationPoint text="Works with your existing Gmail account" />
              <IntegrationPoint text="No setup required - just connect and start talking" />
              <IntegrationPoint text="Secure, private, and isolated to your data only" />
              <IntegrationPoint text="Available on web, mobile, and desktop" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
    >
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-purple-100">{description}</p>
    </motion.div>
  );
}

function PersonaCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-purple-800/20 border border-purple-600/30 rounded-xl p-6 text-center hover:bg-purple-800/30 transition-all duration-200">
      <div className="text-purple-400 mb-3 flex justify-center">{icon}</div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-purple-200 text-sm">{description}</p>
    </div>
  );
}

function IntegrationPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start">
      <div className="text-green-400 mr-3 mt-1">✓</div>
      <p className="text-purple-100">{text}</p>
    </div>
  );
}
