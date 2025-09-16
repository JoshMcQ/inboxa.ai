import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { getMessage } from "@/utils/gmail/message";
import { parseMessage } from "@/utils/mail";
import { replyToEmail } from "@/utils/gmail/mail";

export const POST = withEmailAccount(async (request, context) => {
  const emailAccountId = request.auth.emailAccountId;
  const gmail = await getGmailClientForEmail({ emailAccountId });

  const params = await context.params;
  const messageId = params?.messageId;
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reply = body?.body || body?.reply || body?.message || "";
  if (!reply) {
    return NextResponse.json({ error: "reply body required" }, { status: 400 });
  }

  const msg = await getMessage(messageId, gmail, "full");
  const parsed = parseMessage(msg);
  await replyToEmail(gmail, parsed, String(reply));

  return NextResponse.json({ status: "ok" });
});

