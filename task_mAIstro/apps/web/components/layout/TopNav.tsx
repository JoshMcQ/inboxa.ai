"use client";

import { useRouter } from "next/navigation";
import { MagnifyingGlass, Plus, Circle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import { useState } from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopNav() {
  const router = useRouter();
  const { onOpen } = useComposeModal();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b">
      <div className="mx-auto max-w-screen-2xl px-4 h-12 flex items-center gap-3">
        {/* Omnisearch */}
        <button
          onClick={() => setCommandOpen(true)}
          className="h-8 px-3 rounded-full border text-sm flex items-center gap-2 hover:bg-muted transition-colors text-foreground"
          aria-label="Open command palette"
        >
          <MagnifyingGlass size={16} weight="regular" />
          Search mail, tasks, web
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Compose Button with Gradient */}
          <Button
            onClick={onOpen}
            className="h-8 px-3 rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500 text-white text-sm flex items-center gap-2 transition-all duration-200"
          >
            <Plus size={16} weight="regular" />
            Compose
          </Button>
          
          {/* Status Indicator */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Circle size={8} weight="fill" className="text-emerald-500" />
            Online
          </span>
        </div>
      </div>
      
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} commandProps={{}}>
        <CommandInput placeholder="Search emails, create tasks, or ask anything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { onOpen(); setCommandOpen(false); }}>
              <Plus size={16} className="mr-2" />
              Compose Email
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/app-layout/' + window.location.pathname.split('/')[2] + '/mail'); setCommandOpen(false); }}>
              <MagnifyingGlass size={16} className="mr-2" />
              View All Mail
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
