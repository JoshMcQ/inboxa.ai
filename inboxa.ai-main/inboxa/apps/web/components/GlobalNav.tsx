"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils";
import { 
  HomeIcon,
  MailIcon,
  CalendarIcon,
  CogIcon,
  BarChart3Icon,
  UsersIcon,
  PuzzleIcon,
  SettingsIcon,
  CommandIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/providers/EmailAccountProvider";
import { prefixPath } from "@/utils/path";

const NAVIGATION_ITEMS = [
  {
    name: "Home",
    href: "/home",
    icon: HomeIcon,
    description: "Morning Brief",
  },
  {
    name: "Mail",
    href: "/mail",
    icon: MailIcon,
    description: "Inbox + Bundles",
  },
  {
    name: "Planner",
    href: "/planner",
    icon: CalendarIcon,
    description: "Day/agenda view",
    isNew: true,
  },
  {
    name: "Automations",
    href: "/automation",
    icon: CogIcon,
    description: "NL rules + tests",
  },
  {
    name: "Senders",
    href: "/unsubscribe",
    icon: UsersIcon,
    description: "Volume, engagement",
  },
  {
    name: "Insights",
    href: "/stats",
    icon: BarChart3Icon,
    description: "Weekly scorecards",
  },
  {
    name: "Connectors",
    href: "/connectors",
    icon: PuzzleIcon,
    description: "Add/manage integrations",
    isNew: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    description: "Identity, voice, privacy",
  },
] as const;

interface GlobalNavProps {
  className?: string;
}

export function GlobalNav({ className }: GlobalNavProps) {
  const pathname = usePathname();
  const { emailAccountId } = useAccount();

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === prefixPath(emailAccountId, "/home") || pathname === `/app-layout/${emailAccountId}`;
    }
    return pathname.includes(href);
  };

  return (
    <nav className={cn(
      "w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full",
      className
    )}>
      {/* Header with search and voice */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <MailIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="font-semibold text-sidebar-foreground">Inboxa.ai</div>
          </div>
        </div>
        
        {/* Omnisearch */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <CommandIcon className="size-4 mr-2" />
          Search anything...
          <kbd className="ml-auto bg-sidebar-accent rounded px-1.5 py-0.5 text-xs">⌘K</kbd>
        </Button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const active = isActive(item.href);
            const href = prefixPath(emailAccountId, item.href);
            
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && [
                    "bg-primary/10 text-primary border-l-2 border-primary",
                    "shadow-sm"
                  ],
                  !active && "text-sidebar-foreground/80"
                )}
              >
                <item.icon className={cn(
                  "size-4 flex-shrink-0 transition-colors",
                  active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {(item as any).isNew && (
                      <span className="pill-match text-xs">New</span>
                    )}
                  </div>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer with account info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">J</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground">Joshua</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">joshua@example.com</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
