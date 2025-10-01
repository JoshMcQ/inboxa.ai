"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { CommandK } from "@/components/CommandK";
import { AssistantDrawer } from "@/components/AssistantDrawer";
import {
  SearchIcon,
  PenLineIcon,
  HomeIcon,
  SparklesIcon,
  MailIcon,
  ScissorsIcon,
  BarChart3Icon,
  SettingsIcon,
  MenuIcon,
  CheckCircleIcon,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  emailAccountId?: string;
  className?: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

export function AppShell({ children, emailAccountId, className }: AppShellProps) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Mock sync status
  const syncStatus = {
    service: "Gmail",
    lastSync: "1m ago",
    isHealthy: true
  };

  const navItems: NavItem[] = [
    {
      icon: <HomeIcon className="w-5 h-5" />,
      label: "Today",
      href: `/app-layout/${emailAccountId}/today`,
      isActive: pathname?.includes('/today')
    },
    {
      icon: <SparklesIcon className="w-5 h-5" />,
      label: "Assistant", 
      href: `/app-layout/${emailAccountId}/assistant`,
      isActive: pathname?.includes('/assistant')
    },
    {
      icon: <MailIcon className="w-5 h-5" />,
      label: "Mail",
      href: `/app-layout/${emailAccountId}/mail`, 
      isActive: pathname?.includes('/mail')
    },
    {
      icon: <ScissorsIcon className="w-5 h-5" />,
      label: "Unsubscribe",
      href: `/app-layout/${emailAccountId}/unsubscribe`,
      isActive: pathname?.includes('/unsubscribe')
    },
    {
      icon: <BarChart3Icon className="w-5 h-5" />,
      label: "Insights", 
      href: `/app-layout/${emailAccountId}/stats`,
      isActive: pathname?.includes('/stats')
    },
    {
      icon: <SettingsIcon className="w-5 h-5" />,
      label: "Settings",
      href: `/app-layout/${emailAccountId}/settings`,
      isActive: pathname?.includes('/settings')
    },
  ];

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Top Bar - 64px */}
      <header className="app-header bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-30">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setNavExpanded(!navExpanded)}
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon className="w-4 h-4" />
            <span className="text-sm">Search or ask AI...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-100 rounded border">⌘K</kbd>
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Compose */}
          <Button className="btn-primary">
            <PenLineIcon className="w-4 h-4 mr-2" />
            Compose
          </Button>
          
          {/* Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
            <CheckCircleIcon className="w-3 h-3" />
            <span>{syncStatus.service} · synced {syncStatus.lastSync}</span>
          </div>
          
          {/* Account */}
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-700">A</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Nav Rail - 56px, expands to 240px on hover */}
        <nav 
          className={cn(
            "nav-rail hidden lg:flex flex-col transition-all duration-300 ease-out z-20",
            navExpanded || "w-14 hover:w-60"
          )}
          onMouseEnter={() => setNavExpanded(true)}
          onMouseLeave={() => setNavExpanded(false)}
        >
          <div className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  item.isActive 
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={cn(
                  "transition-opacity duration-200",
                  navExpanded ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Nav Overlay */}
        {navExpanded && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setNavExpanded(false)}>
            <nav className="w-64 h-full bg-white border-r border-gray-200 p-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.href);
                      setNavExpanded(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.isActive 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-canvas mx-auto">
            {children}
          </div>
        </main>

        {/* Assistant Drawer */}
        <AssistantDrawer 
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />
      </div>

      {/* Command K */}
      {commandOpen && (
        <CommandK />
      )}
    </div>
  );
}
