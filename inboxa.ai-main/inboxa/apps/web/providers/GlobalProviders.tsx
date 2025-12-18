import type React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider } from "@/providers/SessionProvider";
import { SWRProvider } from "@/providers/SWRProvider";
import { StatLoaderProvider } from "@/providers/StatLoaderProvider";
import { ComposeModalProvider } from "@/providers/ComposeModalProvider";
import { EmailAccountProvider } from "@/providers/EmailAccountProvider";
import { ThemeProvider } from "@/components/theme-provider";

export function GlobalProviders(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <NuqsAdapter>
        <EmailAccountProvider>
          <SWRProvider>
            <SessionProvider>
              <StatLoaderProvider>
                <ComposeModalProvider>{props.children}</ComposeModalProvider>
              </StatLoaderProvider>
            </SessionProvider>
          </SWRProvider>
        </EmailAccountProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
