"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { prefixPath } from "@/utils/path";
import { useAccount } from "@/providers/EmailAccountProvider";

/**
 * Global keyboard shortcuts
 * - / focus search
 * - c open compose
 * - a open assistant drawer (or navigate to /assistant as fallback)
 * - g then i go to Inbox
 * - ? open shortcuts modal (dispatches event)
 */
export function useShortcuts(opts: {
  getSearchInput?: () => HTMLInputElement | null;
  onCompose?: () => void;
}) {
  const router = useRouter();
  const { emailAccountId } = useAccount();

  useEffect(() => {
    let lastKey: string | null = null;
    let lastTime = 0;

    function navigate(path: `/${string}`) {
      const url = prefixPath(emailAccountId, path);
      router.push(url);
    }

    function onKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs/textareas/contenteditable
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      // ? shortcuts modal
      if (e.key === "?" && e.shiftKey && !e.metaKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("shortcuts:open"));
        return;
      }

      if (isTyping) {
        // allow ESC to blur focused field
        if (e.key === "Escape") (target as HTMLElement).blur();
        return;
      }

      // / focus search
      if (e.key === "/" && !e.metaKey) {
        e.preventDefault();
        const el = opts.getSearchInput?.();
        if (el) {
          el.focus();
          el.select?.();
        }
        return;
      }

      // c compose
      if (e.key.toLowerCase() === "c" && !e.metaKey) {
        e.preventDefault();
        opts.onCompose?.();
        return;
      }

      // a open assistant drawer (or route)
      if (e.key.toLowerCase() === "a" && !e.metaKey) {
        e.preventDefault();
        const event = new CustomEvent("assistant:toggle");
        window.dispatchEvent(event);
        // Fallback: if no drawer listener, navigate
        setTimeout(() => navigate("/assistant"), 50);
        return;
      }

      // g then i -> inbox (mail)
      const now = Date.now();
      if (e.key.toLowerCase() === "g") {
        lastKey = "g";
        lastTime = now;
        return;
      }
      if (
        e.key.toLowerCase() === "i" &&
        lastKey === "g" &&
        now - lastTime < 1200
      ) {
        e.preventDefault();
        lastKey = null;
        navigate("/mail");
        return;
      }
      // reset sequence after timeout
      if (now - lastTime >= 1200) {
        lastKey = null;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailAccountId, router, opts.getSearchInput, opts.onCompose]);
}
