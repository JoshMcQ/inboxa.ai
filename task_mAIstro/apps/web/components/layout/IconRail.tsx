"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  House, 
  Envelope, 
  CalendarCheck, 
  Users, 
  Sparkle, 
  ChartLineUp, 
  Plugs,
  Gear
} from "@phosphor-icons/react";
import { useAccount } from "@/providers/EmailAccountProvider";
import { prefixPath } from "@/utils/path";
import { cn } from "@/utils";

const NAVIGATION_ITEMS = [
  { label: "Home", icon: House, path: "home" },
  { label: "Mail", icon: Envelope, path: "mail" },
  { label: "Planner", icon: CalendarCheck, path: "planner" },
  { label: "Senders", icon: Users, path: "unsubscribe" }, // Keep route as unsubscribe for now
  { label: "Automations", icon: Sparkle, path: "automation" },
  { label: "Insights", icon: ChartLineUp, path: "stats" },
  { label: "Connectors", icon: Plugs, path: "connectors" },
  { label: "Settings", icon: Gear, path: "settings" },
];

export function IconRail() {
  const pathname = usePathname();
  const { emailAccountId } = useAccount();

  const isActive = (path: string) => {
    if (path === "home") {
      return pathname === prefixPath(emailAccountId, "/home") || pathname === `/app-layout/${emailAccountId}`;
    }
    return pathname.includes(`/${path}`);
  };

  return (
    <aside className="w-14 border-r bg-background flex flex-col">
      <nav className="py-3 flex flex-col items-center gap-2">
        {NAVIGATION_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          const href = prefixPath(emailAccountId, `/${path}`);
          
          return (
            <Link
              key={path}
              href={href}
              className={cn(
                "group relative p-2 rounded-xl transition-all duration-200",
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={22} weight={active ? "fill" : "regular"} />
              
              {/* Tooltip */}
              <span className={cn(
                "pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs shadow-lg transition-opacity duration-200",
                "bg-popover text-popover-foreground border",
                "opacity-0 group-hover:opacity-100"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}