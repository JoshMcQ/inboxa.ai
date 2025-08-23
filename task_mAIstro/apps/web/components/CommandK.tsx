"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArchiveIcon, PenLineIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useNavigation } from "@/components/SideNav";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import { refetchEmailListAtom } from "@/store/email";
import { archiveEmails } from "@/store/archive-queue";
import { useDisplayedEmail } from "@/hooks/useDisplayedEmail";
import { useAccount } from "@/providers/EmailAccountProvider";

export function CommandK() {
  const [open, setOpen] = React.useState(false);

  const router = useRouter();
  const { emailAccountId } = useAccount();

  const { threadId, showEmail } = useDisplayedEmail();
  const refreshEmailList = useAtomValue(refetchEmailListAtom);

  const { onOpen: onOpenComposeModal } = useComposeModal();

  const onArchive = React.useCallback(() => {
    if (threadId) {
      const threadIds = [threadId];
      archiveEmails({
        threadIds,
        onSuccess: () => {
          return refreshEmailList?.refetch({ removedThreadIds: threadIds });
        },
        emailAccountId,
      });
      showEmail(null);
    }
  }, [refreshEmailList, threadId, showEmail, emailAccountId]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (
        (e.key === "e" || e.key === "E") &&
        !(e.metaKey || e.ctrlKey)
      ) {
        // only archive if the focus is on the body, to prevent when typing in an input
        if (document?.activeElement?.tagName === "BODY") {
          e.preventDefault();
          onArchive();
        }
      } else if (
        (e.key === "c" || e.key === "C") &&
        !(e.metaKey || e.ctrlKey)
      ) {
        // only open compose if the focus is on the body, to prevent when typing in an input
        if (document?.activeElement?.tagName === "BODY") {
          e.preventDefault();
          onOpenComposeModal();
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onArchive, onOpenComposeModal]);

  const navigation = useNavigation();

  // Back-compat and resilience:
  // Normalize items so CommandK doesn't break if useNavigation shape changes.
  const allNavItems =
    [
      ...(navigation?.assistantItems ?? []),
      ...(navigation?.cleanItems ?? []),
      ...(navigation?.mainItems ?? []),
    ]
      // de-dup by name+href
      .filter(Boolean)
      .reduce(
        (acc: Array<any>, item: any) => {
          if (!item) return acc;
          const key = `${item.name}|${item.href}`;
          if (!acc.some((i) => `${i.name}|${i.href}` === key)) acc.push(item);
          return acc;
        },
        [],
      );

  const assistantGroup = allNavItems.filter((i) =>
    String(i.name || "").toLowerCase().includes("assistant"),
  );

  // Tools bucket based on label keywords
  const toolsKeywords = ["unsubscribe", "clean", "insights", "automation"];
  const toolsGroup = allNavItems.filter((i) =>
    toolsKeywords.some((k) =>
      String(i.name || "").toLowerCase().includes(k),
    ),
  );

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={{
          onKeyDown: (e) => {
            // allow closing modal
            if (e.key !== "Escape") {
              // stop propagation to prevent keyboard shortcuts from firing on the page
              e.stopPropagation();
            }
          },
        }}
      >
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            {threadId && (
              <CommandItem
                onSelect={() => {
                  onArchive();
                  setOpen(false);
                }}
              >
                <ArchiveIcon className="mr-2 h-4 w-4" />
                <span>Archive</span>
                <CommandShortcut>E</CommandShortcut>
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => {
                setOpen(false);
                onOpenComposeModal();
              }}
            >
              <PenLineIcon className="mr-2 h-4 w-4" />
              <span>Compose</span>
              <CommandShortcut>C</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {assistantGroup.length > 0 && (
            <CommandGroup heading="Assistant">
              {assistantGroup.map((option) => (
                <CommandItem
                  key={`${option.name}-${option.href}`}
                  onSelect={() => {
                    router.push(option.href);
                    setOpen(false);
                  }}
                >
                  {option.icon ? (
                    <option.icon className="mr-2 h-4 w-4" />
                  ) : null}
                  <span>{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {toolsGroup.length > 0 && (
            <CommandGroup heading="Tools">
              {toolsGroup.map((option) => (
                <CommandItem
                  key={`${option.name}-${option.href}`}
                  onSelect={() => {
                    router.push(option.href);
                    setOpen(false);
                  }}
                >
                  {option.icon ? (
                    <option.icon className="mr-2 h-4 w-4" />
                  ) : null}
                  <span>{option.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
