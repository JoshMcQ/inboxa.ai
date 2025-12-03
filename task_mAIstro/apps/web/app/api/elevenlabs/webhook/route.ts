import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { env } from "@/env";
import prisma from "@/utils/prisma";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("elevenlabs/webhook");

// ElevenLabs ConvAI can POST events to a webhook URL you configure in their dashboard
// We'll accept JSON payloads, optionally verify an HMAC signature if ELEVENLABS_WEBHOOK_SECRET is set,
// then persist a minimal AgentEvent row for observability.
export const POST = withError(async (request: Request) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // Optional lightweight token gate via env.WEBHOOK_URL token param (mirrors google approach)
  if (env.CRON_SECRET && token && token !== env.CRON_SECRET) {
    logger.warn("Invalid token on ElevenLabs webhook", { token });
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Read raw body for signature check
  const textBody = await request.text();

  // Optional HMAC signature verification. Header name inferred; if absent, we skip verification.
  // If you configure ELEVENLABS_WEBHOOK_SECRET in your .env, we'll verify against `x-elevenlabs-signature`.
  const signatureHeader = request.headers.get("x-elevenlabs-signature");
  if (env.ELEVENLABS_WEBHOOK_SECRET && signatureHeader) {
    try {
      const hmac = crypto.createHmac("sha256", env.ELEVENLABS_WEBHOOK_SECRET);
      const digest = Buffer.from(hmac.update(textBody).digest("hex"), "utf8");
      const provided = Buffer.from(signatureHeader, "utf8");
      if (!crypto.timingSafeEqual(digest, provided)) {
        logger.error("Invalid ElevenLabs webhook signature");
        return NextResponse.json({ ok: false }, { status: 400 });
      }
    } catch (err) {
      logger.error("Error verifying ElevenLabs signature", { err });
      return NextResponse.json({ ok: false }, { status: 400 });
    }
  }

  // Parse JSON after signature verification to avoid altering raw body
  const payload = safeJsonParse(textBody);

  // Best-effort identify a user. Support a few shapes commonly used for agents:
  // - payload.userId
  // - payload.user_id
  // - payload.metadata?.userId
  // - payload.session?.userId
  const userId: string | undefined =
    (payload?.userId as string | undefined) ||
    (payload?.user_id as string | undefined) ||
    (payload?.metadata?.userId as string | undefined) ||
    (payload?.session?.userId as string | undefined);

  // Minimal insert into AgentEvent for observability. If no userId, still store with null userId.
  try {
    if (userId) {
      await prisma.agentEvent.create({
        data: {
          userId,
          kind: (payload?.event || payload?.type || "agent.event") as string,
          targetId: (payload?.targetId || payload?.conversation_id || null) as string | null,
          payload,
        },
      });
    }
  } catch (err) {
    logger.error("Failed to persist AgentEvent from ElevenLabs", { err });
  }

  logger.info("Received ElevenLabs webhook", {
    event: payload?.event || payload?.type,
    userId,
  });

  // TODO: If specific events should trigger app workflows, branch here based on payload.event/type

  return NextResponse.json({ ok: true });
});

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text };
  }
}
