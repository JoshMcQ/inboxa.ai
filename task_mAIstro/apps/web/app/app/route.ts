import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { env } from "@/env";

/**
 * /app alias
 * Redirects to the user's first email account home (/app-layout/[id]/setup by default),
 * or to onboarding when the user has no linked accounts.
 */
export async function GET(request: Request) {
  const session = await auth();
  const origin = new URL(request.url).origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const userId = session.user.id;

  // Find user's first email account
  const account = await prisma.emailAccount.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!account) {
    // No accounts yet -> global onboarding
    return NextResponse.redirect(new URL("/app-layout/onboarding", origin));
  }

  const appHomePath = env.NEXT_PUBLIC_APP_HOME_PATH || "/home"; // default to new Home
  const target = `/app-layout/${account.id}${appHomePath}`;

  return NextResponse.redirect(new URL(target, origin));
}