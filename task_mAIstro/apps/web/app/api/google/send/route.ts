import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailClientForEmail } from "@/utils/account";
import { sendEmailWithHtml } from "@/utils/gmail/mail";

export const POST = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;
  const gmail = await getGmailClientForEmail({ emailAccountId });

  const body = await request.json().catch(() => ({}));
  const to = body?.to || body?.recipient;
  const subject = body?.subject || "";
  const content = body?.body || body?.message || body?.html || "";

  if (!to || !subject || !content) {
    return NextResponse.json(
      { error: "Missing fields (to, subject, body)" },
      { status: 400 },
    );
  }

  await sendEmailWithHtml(gmail, {
    to,
    subject,
    messageHtml: typeof content === "string" ? content : String(content),
  });

  return NextResponse.json({ status: "ok" });
});

