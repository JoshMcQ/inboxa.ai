"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon | ((props: any) => React.ReactNode);
  target?: "_blank";
  count?: number;
  hideInMail?: boolean;
  active?: boolean;
};

export function SideNavMenu({
  items,
  activeHref,
}: {
  items: NavItem[];
  activeHref: string;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = item.active || activeHref === item.href;
        return (
          <SidebarMenuItem key={item.name} className="font-semibold">
            <SidebarMenuButton
              asChild
              isActive={active}
              // Add active visual per blueprint: left indigo stripe and stronger label
              className={
                "h-9 relative " +
                (active
                  ? "pl-2 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-indigo-600 text-gray-900 font-medium"
                  : "")
              }
              tooltip={item.name}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
