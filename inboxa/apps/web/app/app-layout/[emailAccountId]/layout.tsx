import { ReactNode } from "react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

/**
 * Nested account layout (passthrough)
 * IMPORTANT: App shell is already mounted at app/app-layout/layout.tsx.
 * Do NOT mount headers/nav/drawers here to avoid duplicate chrome.
 */
export default async function AccountLayout(props: {
  children: ReactNode;
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await props.params;
  await checkUserOwnsEmailAccount({ emailAccountId });
  return <>{props.children}</>;
}