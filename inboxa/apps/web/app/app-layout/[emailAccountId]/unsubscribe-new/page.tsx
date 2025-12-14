import { Suspense } from "react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { UnsubscribePageClient } from "./UnsubscribePageClient";

/**
 * InboxA.AI Unsubscribe Page
 * 
 * Features per spec:
 * - Summary bar with "Found K senders" and date range
 * - Run sweep button (primary) at right
 * - Table: Sender · Emails (bar) · Read% · Archived% · Last seen · Action
 * - Row click → details drawer with examples
 * - Run sweep → modal progress + Undo
 */
export default async function UnsubscribeNewPage(props: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await props.params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <UnsubscribePageClient emailAccountId={emailAccountId} />
    </Suspense>
  );
}