import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";
import { PermissionsCheck } from "@/app/app-layout/[emailAccountId]/PermissionsCheck";
import { GmailProvider } from "@/providers/GmailProvider";
import { ASSISTANT_ONBOARDING_COOKIE } from "@/utils/cookies";
import { prefixPath } from "@/utils/path";
import { Chat } from "@/components/assistant-chat/chat";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { AssistantPageClient } from "./AssistantPageClient";

export const maxDuration = 300; // Applies to the actions

export default async function AssistantPage({
  params,
  searchParams,
}: {
  params: Promise<{ emailAccountId: string }>;
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const { emailAccountId } = await params;
  const { onboarding } = await searchParams;
  await checkUserOwnsEmailAccount({ emailAccountId });

  // onboarding redirect
  const cookieStore = await cookies();
  const viewedOnboarding =
    cookieStore.get(ASSISTANT_ONBOARDING_COOKIE)?.value === "true";

  if (!viewedOnboarding) {
    const hasRule = await prisma.rule.findFirst({
      where: { emailAccountId },
      select: { id: true },
    });

    if (!hasRule) {
      if (onboarding === "true") {
        // Show onboarding flow using client component
        return (
          <GmailProvider>
            <Suspense>
              <PermissionsCheck />
              <AssistantPageClient emailAccountId={emailAccountId} showOnboarding={true} />
            </Suspense>
          </GmailProvider>
        );
      }
      redirect(prefixPath(emailAccountId, "/assistant?onboarding=true"));
    }
  }

  return (
    <GmailProvider>
      <Suspense>
        <PermissionsCheck />
        <AssistantPageClient emailAccountId={emailAccountId} showOnboarding={false} />
      </Suspense>
    </GmailProvider>
  );
}
