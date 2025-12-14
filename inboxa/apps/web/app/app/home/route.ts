import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { env } from "@/env";

/**
 * /app/home alias
 * Redirects to the account-aware home (/app-layout/[id]/setup by default).
 */
export async function GET(request: Request) {
  const session = await auth();
  const origin = new URL(request.url).origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const userId = session.user.id;

  const account = await prisma.emailAccount.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.redirect(new URL("/app-layout/onboarding", origin));
  }

  const appHomePath = env.NEXT_PUBLIC_APP_HOME_PATH || "/home";
  const target = `/app-layout/${account.id}${appHomePath}`;

  return NextResponse.redirect(new URL(target, origin));
}