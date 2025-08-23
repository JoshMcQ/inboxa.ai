"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const navigation = [
  { name: "Features", href: "/features" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Enterprise", href: "/enterprise" },
];

export function Header({ className }: { className?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const posthog = usePostHog();

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 bg-white shadow-sm", className)}>
      <nav
        className="flex items-center justify-between px-6 py-4 lg:px-8 max-w-7xl mx-auto"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-[#1a365d]">InboxaAI</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-[#1a365d] transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button 
            size="default" 
            variant="ghost" 
            className="text-gray-700 hover:text-[#1a365d] hover:bg-gray-50 font-medium" 
            asChild
          >
            <Link
              href="/login"
              onClick={() => {
                posthog.capture("Clicked Log In", { position: "top-nav" });
              }}
            >
              Login
            </Link>
          </Button>
          <Button 
            size="default" 
            className="bg-[#1a365d] hover:bg-[#2c5282] text-white font-medium px-6" 
            asChild
          >
            <Link
              href="/login"
              onClick={() => {
                posthog.capture("Clicked Sign Up", { position: "top-nav" });
              }}
            >
              Start Free Trial
            </Link>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-[#1a365d]">InboxaAI</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-200">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1a365d]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-3">
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1a365d]"
                  onClick={() => {
                    posthog.capture("Clicked Log In", { position: "mobile-nav" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="block rounded-md bg-[#1a365d] px-6 py-3 text-center text-base font-medium text-white hover:bg-[#2c5282]"
                  onClick={() => {
                    posthog.capture("Clicked Sign Up", { position: "mobile-nav" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
