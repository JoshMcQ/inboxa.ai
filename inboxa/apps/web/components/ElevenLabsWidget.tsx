"use client";
/// <reference path="../types/custom-elements.d.ts" />

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface ElevenLabsWidgetProps {
  emailAccountId?: string;
  userId?: string;
  className?: string;
}

export function ElevenLabsWidget({ emailAccountId, userId, className }: ElevenLabsWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  
  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.head.appendChild(script);

      const style = document.createElement("style");
      style.textContent = `
        elevenlabs-convai {
          --el-primary-color: hsl(var(--primary));
          --el-background-color: hsl(var(--background));
          --el-text-color: hsl(var(--foreground));
          --el-border-color: hsl(var(--border));
          --el-accent-color: hsl(var(--accent));
        }

        .dark elevenlabs-convai {
          --el-background-color: hsl(var(--background));
          --el-text-color: hsl(var(--foreground));
          --el-border-color: hsl(var(--border));
        }

        elevenlabs-convai * {
          transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  let derivedEmailAccountId: string | undefined = undefined;
  if (pathname) {
    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("app-layout");
    if (idx !== -1 && parts[idx + 1]) {
      derivedEmailAccountId = parts[idx + 1];
    }
  }
  const currentEmailAccountId = emailAccountId || derivedEmailAccountId || undefined;

  const dynamicVariables = {
    email_account_id: currentEmailAccountId || "demo-email-account",
    user_id: userId || "demo-user",
    theme: resolvedTheme || theme || "light",
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handleClick = () => {
      window.dispatchEvent(new CustomEvent("inboxa:elevenlabs-click"));
    };
    node.addEventListener("click", handleClick);
    return () => node.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const inboxa = ((window as any).InboxA = (window as any).InboxA || {});
    inboxa.emitSummariesCommand = (command: string) => {
      window.dispatchEvent(
        new CustomEvent("inboxa:voice-summaries-command", {
          detail: { command },
        }),
      );
    };
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const primaryColor = "#4F66FF";
  const secondaryColor = isDark ? "#3A47FF" : "#2F38D9";

  if (!mounted) {
    return <div ref={containerRef} className={className} style={{ height: 60, width: 60 }} />;
  }

  return (
    <div ref={containerRef} className={className}>
      {
        // eslint-disable-next-line react/no-unknown-property
        // @ts-expect-error custom element typing
        <elevenlabs-convai
          agent-id="agent_9601k3hwqdx7egfv140dxt2d4xfx"
          dynamic-variables={JSON.stringify(dynamicVariables)}
          avatar-orb-color-1={primaryColor}
          avatar-orb-color-2={secondaryColor}
          style={{ colorScheme: isDark ? "dark" : "light" }}
        />
      }
    </div>
  );
}
