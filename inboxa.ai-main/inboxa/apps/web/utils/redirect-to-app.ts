import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { env } from "@/env";

/**
 * Redirects user to the main app with the correct emailAccountId
 * If user has multiple email accounts, redirects to the primary one
 */
export async function redirectToApp(fallbackPath?: string) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Get the user's email accounts
  const emailAccounts = await prisma.emailAccount.findMany({
    where: { userId: session.user.id },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" }, // Primary account is usually the first one
  });

  if (emailAccounts.length === 0) {
    // This shouldn't happen if auth is working correctly, but handle it
    redirect("/login");
  }

  // Use the primary email account (first one, usually matches user.email)
  const primaryAccount = emailAccounts.find(
    (account) => account.email === session.user.email
  ) || emailAccounts[0];

  const appPath = fallbackPath || env.NEXT_PUBLIC_APP_HOME_PATH;
  redirect(`/app-layout/${primaryAccount.id}${appPath}`);
}

/**
 * Gets the user's primary email account ID
 */
export async function getPrimaryEmailAccountId(): Promise<string | null> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  const emailAccount = await prisma.emailAccount.findFirst({
    where: { 
      userId: session.user.id,
      email: session.user.email 
    },
    select: { id: true },
  });

  return emailAccount?.id || null;
}