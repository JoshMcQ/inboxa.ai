"use client";
/// <reference path="../types/custom-elements.d.ts" />

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface ElevenLabsWidgetProps {
  emailAccountId?: string;
  userId?: string;
  className?: string;
}

export function ElevenLabsWidget({ emailAccountId, userId, className }: ElevenLabsWidgetProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  
  useEffect(() => {
    // Load ElevenLabs widget script if not already loaded
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);
      
      // Add custom styles for the widget to match our design system
      const style = document.createElement('style');
      style.textContent = `
        /* ElevenLabs Widget Theme Integration */
        elevenlabs-convai {
          --el-primary-color: hsl(var(--primary));
          --el-background-color: hsl(var(--background));
          --el-text-color: hsl(var(--foreground));
          --el-border-color: hsl(var(--border));
          --el-accent-color: hsl(var(--accent));
        }
        
        /* Ensure widget respects dark mode */
        .dark elevenlabs-convai {
          --el-background-color: hsl(var(--background));
          --el-text-color: hsl(var(--foreground));
          --el-border-color: hsl(var(--border));
        }
        
        /* Smooth transitions for theme changes */
        elevenlabs-convai * {
          transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Extract emailAccountId from URL if not provided
  // Expected paths look like: /app/app-layout/{emailAccountId}/...
  // So find the segment after 'app-layout'
  let derivedEmailAccountId: string | undefined = undefined;
  if (pathname) {
    const parts = pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('app-layout');
    if (idx !== -1 && parts[idx + 1]) {
      derivedEmailAccountId = parts[idx + 1];
    }
  }
  const currentEmailAccountId = emailAccountId || derivedEmailAccountId || undefined;

  // Create the dynamic variables object
  const dynamicVariables = {
    email_account_id: currentEmailAccountId || "cmej6xrtq0004t2ukwvgm0ux6",
    user_id: userId || "cmej6xrig0000t2uk0jppbmw3",
    theme: resolvedTheme || 'light'
  };

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic colors based on theme - only after mounted to avoid hydration mismatch
  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const primaryColor = '#4F66FF'; // Consistent primary color
  const secondaryColor = isDark ? '#3A47FF' : '#2F38D9';
  
  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return <div className={className} style={{ height: '60px', width: '60px' }} />;
  }
  
  return (
    <div className={className}>
      {(
        // Use createElement to avoid TS/JSX custom element typing issues
        // while preserving attributes expected by the ElevenLabs web component
        // eslint-disable-next-line react/no-unknown-property
        // @ts-expect-error - custom element not in JSX.IntrinsicElements
        <elevenlabs-convai
          agent-id="agent_9601k3hwqdx7egfv140dxt2d4xfx"
          dynamic-variables={JSON.stringify(dynamicVariables)}
          avatar-orb-color-1={primaryColor}
          avatar-orb-color-2={secondaryColor}
          style={{ colorScheme: isDark ? 'dark' : 'light' }}
        />
      )}
    </div>
  );
}
