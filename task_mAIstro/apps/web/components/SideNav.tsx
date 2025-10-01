"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  BarChartBigIcon,
  BookIcon,
  BrushIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  CrownIcon,
  FileIcon,
  HomeIcon,
  InboxIcon,
  type LucideIcon,
  MailsIcon,
  MessagesSquareIcon,
  PenIcon,
  PersonStandingIcon,
  PuzzleIcon,
  RatioIcon,
  SendIcon,
  SparklesIcon,
  TagIcon,
  Users2Icon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { SideNavMenu } from "@/components/SideNavMenu";
import { CommandShortcut } from "@/components/ui/command";
import { useSplitLabels } from "@/hooks/useLabels";
import { LoadingContent } from "@/components/LoadingContent";
import { useCleanerEnabled } from "@/hooks/useFeatureFlags";
import { ClientOnly } from "@/components/ClientOnly";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { useAccount } from "@/providers/EmailAccountProvider";
import { prefixPath } from "@/utils/path";
import { ReferralDialog } from "@/components/ReferralDialog";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon | ((props: any) => React.ReactNode);
  target?: "_blank";
  count?: number;
  hideInMail?: boolean;
};

const AssistantIcon = () => {
  return (
    <div className="relative">
      <SparklesIcon className="size-4" />
    </div>
  );
};

export const useNavigation = () => {
  const showCleaner = useCleanerEnabled();
  const { emailAccountId } = useAccount();

  // Main app items as per new IA structure
  const mainItems: NavItem[] = useMemo(
    () => [
      {
        name: "Home",
        href: prefixPath(emailAccountId, "/home"),
        icon: HomeIcon,
      },
      {
        name: "Mail",
        href: prefixPath(emailAccountId, "/mail"),
        icon: InboxIcon,
      },
      {
        name: "Planner",
        href: prefixPath(emailAccountId, "/planner"),
        icon: BookIcon,
      },
      {
        name: "Senders",
        href: prefixPath(emailAccountId, "/unsubscribe"),
        icon: Users2Icon,
      },
      {
        name: "Automations",
        href: prefixPath(emailAccountId, "/automation"),
        icon: BrushIcon,
      },
      {
        name: "Insights",
        href: prefixPath(emailAccountId, "/stats"),
        icon: BarChartBigIcon,
      },
      {
        name: "Connectors",
        href: prefixPath(emailAccountId, "/connectors"),
        icon: PuzzleIcon,
      },
    ],
    [emailAccountId],
  );

  // Optionally hide Automations/Cleaner-dependent items if feature flag is off
  const filteredMain = useMemo(() => {
    return mainItems.filter((item) => {
      if (item.href.endsWith("/clean")) return showCleaner;
      return true;
    });
  }, [mainItems, showCleaner]);

  return {
    mainItems: filteredMain,
  };
};

const bottomLinks: NavItem[] = [
  { name: "Settings", href: "/app-layout/redirects/settings", icon: CogIcon },
];

const topMailLinks: NavItem[] = [
  {
    name: "Inbox",
    icon: InboxIcon,
    href: "?type=inbox",
  },
  {
    name: "All",
    icon: MailsIcon,
    href: "?type=all",
  },
  {
    name: "Drafts",
    icon: FileIcon,
    href: "?type=draft",
  },
  {
    name: "Sent",
    icon: SendIcon,
    href: "?type=sent",
  },
  {
    name: "Archived",
    icon: ArchiveIcon,
    href: "?type=archive",
  },
];

const bottomMailLinks: NavItem[] = [
  {
    name: "Personal",
    icon: PersonStandingIcon,
    href: "?type=CATEGORY_PERSONAL",
  },
  {
    name: "Social",
    icon: Users2Icon,
    href: "?type=CATEGORY_SOCIAL",
  },
  {
    name: "Updates",
    icon: AlertCircleIcon,
    href: "?type=CATEGORY_UPDATES",
  },
  {
    name: "Forums",
    icon: MessagesSquareIcon,
    href: "?type=CATEGORY_FORUMS",
  },
  {
    name: "Promotions",
    icon: RatioIcon,
    href: "?type=CATEGORY_PROMOTIONS",
  },
];

export function SideNav({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigation = useNavigation();
  const path = usePathname();
  const showMailNav = path.includes("/mail") || path.includes("/compose");

  const visibleBottomLinks = useMemo(
    () =>
      showMailNav
        ? [
            {
              name: "Back",
              href: "/app-layout/redirects/automation",
              icon: ArrowLeftIcon,
            },
            ...bottomLinks.filter((l) => !l.hideInMail),
          ]
        : bottomLinks,
    [showMailNav],
  );

  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 pb-0">
        <AccountSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroupContent>
          {showMailNav ? (
            <MailNav path={path} />
          ) : (
            <SidebarGroup>
              <SideNavMenu items={navigation.mainItems} activeHref={path} />
            </SidebarGroup>
          )}
        </SidebarGroupContent>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <ClientOnly>
          <ReferralDialog />
        </ClientOnly>

        <SideNavMenu items={visibleBottomLinks} activeHref={path} />
      </SidebarFooter>
    </Sidebar>
  );
}

function MailNav({ path }: { path: string }) {
  const { onOpen } = useComposeModal();
  const [showHiddenLabels, setShowHiddenLabels] = useState(false);
  const { visibleLabels, hiddenLabels, isLoading } = useSplitLabels();

  // Transform user labels into NavItems
  const labelNavItems = useMemo(() => {
    const searchParams = new URLSearchParams(path.split("?")[1] || "");
    const currentLabelId = searchParams.get("labelId");

    return visibleLabels.map((label) => ({
      name: label.name,
      icon: TagIcon,
      href: `?type=label&labelId=${encodeURIComponent(label.id)}`,
      // Add active state for the current label
      active: currentLabelId === label.id,
    }));
  }, [visibleLabels, path]);

  // Transform hidden labels into NavItems
  const hiddenLabelNavItems = useMemo(() => {
    const searchParams = new URLSearchParams(path.split("?")[1] || "");
    const currentLabelId = searchParams.get("labelId");

    return hiddenLabels.map((label) => ({
      name: label.name,
      icon: TagIcon,
      href: `?type=label&labelId=${encodeURIComponent(label.id)}`,
      // Add active state for the current label
      active: currentLabelId === label.id,
    }));
  }, [hiddenLabels, path]);

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={onOpen}
            >
              <PenIcon className="size-4" />
              <span className="truncate font-semibold">Compose</span>
              <CommandShortcut>C</CommandShortcut>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SideNavMenu items={topMailLinks} activeHref={path} />
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SideNavMenu items={bottomMailLinks} activeHref={path} />
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Labels</SidebarGroupLabel>
        <LoadingContent loading={isLoading}>
          {visibleLabels.length > 0 ? (
            <SideNavMenu items={labelNavItems} activeHref={path} />
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No labels
            </div>
          )}

          {/* Hidden labels toggle */}
          {hiddenLabels.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowHiddenLabels(!showHiddenLabels)}
                className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {showHiddenLabels ? (
                  <ChevronDownIcon className="mr-1 size-4" />
                ) : (
                  <ChevronRightIcon className="mr-1 size-4" />
                )}
                <span>More</span>
              </button>

              {showHiddenLabels && (
                <SideNavMenu items={hiddenLabelNavItems} activeHref={path} />
              )}
            </>
          )}
        </LoadingContent>
      </SidebarGroup>
    </>
  );
}
