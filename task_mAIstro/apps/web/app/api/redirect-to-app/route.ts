import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { env } from "@/env";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's email accounts
    const emailAccounts = await prisma.emailAccount.findMany({
      where: { userId: session.user.id },
      select: { id: true, email: true },
      orderBy: { createdAt: "asc" }, // Primary account is usually the first one
    });

    if (emailAccounts.length === 0) {
      return NextResponse.json({ error: "No email accounts found" }, { status: 404 });
    }

    // Use the primary email account (first one, usually matches user.email)
    const primaryAccount = emailAccounts.find(
      (account) => account.email === session.user.email
    ) || emailAccounts[0];

    const appPath = env.NEXT_PUBLIC_APP_HOME_PATH;
    const redirectUrl = `/app-layout/${primaryAccount.id}${appPath}`;

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Error getting redirect URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}