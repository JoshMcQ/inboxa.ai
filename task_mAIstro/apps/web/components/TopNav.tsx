"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  BarChartIcon,
  ChevronDownIcon,
  InboxIcon,
  LogOutIcon,
  MessageCircleReplyIcon,
  RibbonIcon,
  ShieldCheckIcon,
  TagIcon,
  SearchIcon,
  MicIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logOut } from "@/utils/user";
import { cn } from "@/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { prefixPath } from "@/utils/path";
import { useAccount } from "@/providers/EmailAccountProvider";
import { ProfileImage } from "@/components/ProfileImage";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import { MicControl } from "@/components/mic/MicControl";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useGmailStatus } from "@/hooks/useGmailStatus";

export function TopNav({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const { emailAccountId } = useAccount();
  const { onOpen: openCompose } = useComposeModal();
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Header mic state (Idle / Listening / Transcribing/Muted)
  const [micState, setMicState] = useState<"idle" | "listening" | "transcribing" | "muted">("idle");

  // Gmail status pill
  const gmail = useGmailStatus({ refreshMs: 60_000 });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | undefined;
      if (detail === "listening" || detail === "transcribing" || detail === "idle" || detail === "muted") {
        setMicState(detail);
      }
    };
    window.addEventListener("mic:state", handler as EventListener);
    return () => window.removeEventListener("mic:state", handler as EventListener);
  }, []);

  function handleSearchSubmit(formData: FormData) {
    const q = (formData.get("q") as string)?.trim();
    if (!q) return;
    const url = prefixPath(emailAccountId, `/mail?q=${encodeURIComponent(q)}`);
    router.push(url);
  }

  // Wire global shortcuts per spec
  useShortcuts({
    getSearchInput: () => searchRef.current,
    onCompose: openCompose,
  });

  // Mic state dot color
  const micDotClass =
    micState === "listening"
      ? "bg-indigo-600 animate-pulse"
      : micState === "muted"
      ? "bg-gray-400"
      : micState === "transcribing"
      ? "bg-indigo-600"
      : "bg-gray-300";

  return (
    <div className="content-container flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white shadow-sm sm:gap-x-6">
      {trigger}

      <div className="flex flex-1 items-center gap-x-3 lg:gap-x-4">
        {/* Search */}
        <form action={handleSearchSubmit} className="flex flex-1 max-w-xl">
          <div className="flex w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-3 h-11">
            <SearchIcon className="mr-2 h-4 w-4 text-gray-500" />
            <input
              ref={searchRef}
              name="q"
              type="search"
              placeholder="Search mail..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </form>

        {/* Compose (primary) */}
        <Button
          variant="primary"
          size="md"
          onClick={openCompose}
          className="hidden sm:inline-flex"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Compose
        </Button>

        {/* Persistent Mic (icon button with state dot) */}
        <MicControl>
          <Button variant="ghost" size="icon" aria-label="Voice" title="Hold ⌘ to talk" className="relative">
            <MicIcon className="h-5 w-5" />
            <span
              aria-hidden="true"
              className={cn(
                "absolute -right-0.5 -top-0.5 inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white",
                micDotClass,
              )}
            />
          </Button>
        </MicControl>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-x-3 lg:gap-x-4">
          {/* Gmail status pill */}
          <span
            className="hidden rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 sm:inline"
            title={gmail.error ? `Error: ${gmail.error}` : undefined}
            aria-live="polite"
          >
            {gmail.label}
          </span>
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}

function ProfileDropdown() {
  const { data: session, status } = useSession();
  const { emailAccountId, emailAccount } = useAccount();

  const userNavigation = [
    {
      name: "Usage",
      href: prefixPath(emailAccountId, "/usage"),
      icon: BarChartIcon,
    },
    {
      name: "Mail (Beta)",
      href: prefixPath(emailAccountId, "/mail"),
      icon: InboxIcon,
    },
    {
      name: "Reply Now",
      href: prefixPath(emailAccountId, "/r-zero"),
      icon: MessageCircleReplyIcon,
    },
    {
      name: "Cold Email Blocker",
      href: prefixPath(emailAccountId, "/ce-blocker"),
      icon: ShieldCheckIcon,
    },
    {
      name: "Sender Categories",
      href: prefixPath(emailAccountId, "/smart-categories"),
      icon: TagIcon,
    },
    {
      name: "Early Access",
      href: prefixPath(emailAccountId, "/early-access"),
      icon: RibbonIcon,
    },
    {
      name: "Sign out",
      href: "#",
      icon: LogOutIcon,
      onClick: () => logOut(window.location.origin),
    },
  ];

  if (session?.user) {
    return (
      <Menu as="div" className="relative z-50">
        <MenuButton className="-m-1.5 flex items-center p-1.5">
          <span className="sr-only">Open user menu</span>
          <ProfileImage
            image={emailAccount?.image || null}
            label={emailAccount?.name || emailAccount?.email || ""}
          />
          <span className="hidden lg:flex lg:items-center">
            {/* <span
              className="ml-4 text-sm font-semibold leading-6 text-foreground"
              aria-hidden="true"
            >
              {emailAccount?.name || emailAccount?.email || "Account"}
            </span> */}
            <ChevronDownIcon
              className="ml-2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
        </MenuButton>
        <Transition
          as="div"
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 z-20 mt-2.5 w-52 origin-top-right rounded-md bg-popover py-2 shadow-lg ring-1 ring-border focus:outline-none">
            <MenuItem>
              <div className="truncate border-b border-border px-3 pb-2 text-sm text-muted-foreground">
                {session.user.email}
              </div>
            </MenuItem>
            <MenuItem>{({ focus }) => <ThemeToggle focus={focus} />}</MenuItem>
            {userNavigation.map((item) => (
              <MenuItem key={item.name}>
                {({ focus }) => (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-1 text-sm leading-6 text-foreground",
                      focus && "bg-accent",
                    )}
                    onClick={item.onClick}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.name}
                  </Link>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => signIn()}
      loading={status === "loading"}
    >
      Sign in
    </Button>
  );
}
