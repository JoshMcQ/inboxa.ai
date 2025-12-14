import "../../styles/globals.css";
import type React from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { TokenCheck } from "@/components/TokenCheck";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { PostHogIdentify } from "@/providers/PostHogProvider";
import { CommandK } from "@/components/CommandK";
import { AppProviders } from "@/providers/AppProviders";
import { AssessUser } from "@/app/app-layout/[emailAccountId]/assess";
import { LastLogin } from "@/app/app-layout/last-login";
import { SentryIdentify } from "@/app/app-layout/sentry-identify";
import { ErrorMessages } from "@/app/app-layout/ErrorMessages";
import { QueueInitializer } from "@/store/QueueInitializer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EmailViewer } from "@/components/EmailViewer";
import { TopNav } from "@/components/layout/TopNav";
import { IconRail } from "@/components/layout/IconRail";
import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

export const viewport = {
  themeColor: "#FFF",
  // safe area for iOS PWA
  userScalable: false,
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  width: "device-width",
  height: "device-height",
  viewportFit: "cover",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user.email) redirect("/login");

  return (
    <AppProviders>
      {/* Clean Layout Structure: TopNav + IconRail + Content */}
      <div className="min-h-screen grid grid-rows-[auto_1fr]">
        <TopNav />
        <div className="grid grid-cols-[56px_1fr]">
          <IconRail />
          <main className="px-6 py-4 overflow-auto">
            <ErrorMessages />
            {children}
          </main>
        </div>
      </div>
      
      {/* Global Components */}
      <EmailViewer />
      <ErrorBoundary extra={{ component: "AppLayout" }}>
        <PostHogIdentify />
        <TokenCheck />
        <CommandK />
        <QueueInitializer />
        <AssessUser />
        <SentryIdentify email={session.user.email} />
        <Suspense>
          <LastLogin email={session.user.email} />
        </Suspense>
        <Suspense>
          <CrispWithNoSSR email={session.user.email} />
        </Suspense>
        {/* ElevenLabs Voice Assistant Widget - The backbone of the app */}
        <ElevenLabsWidget userId={session.user.id} />
      </ErrorBoundary>
    </AppProviders>
  );
}

const CrispWithNoSSR = dynamic(() => import("@/components/CrispChat"));
