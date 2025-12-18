import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);
    }

    // Get user's email account
    const emailAccount = await prisma.emailAccount.findFirst({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!emailAccount) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);
    }

    const url = new URL(req.url);
    const connectionId = url.searchParams.get('connection_id');
    const hmac = url.searchParams.get('hmac');

    if (!connectionId || !hmac) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/app-layout/${emailAccount.id}/connectors?error=invalid_callback`);
    }

    // Verify HMAC signature from Nango
    const nangoSecretKey = process.env.NANGO_SECRET_KEY;
    if (!nangoSecretKey) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/app-layout/${emailAccount.id}/connectors?error=config_error`);
    }

    // In a real implementation, you would:
    // 1. Verify the HMAC signature
    // 2. Call Nango API to get the connection details
    // 3. Store the connection info in your database

    // For now, let's simulate a successful connection
    // In a production app, you would:
    // 1. Store Slack connection info in database
    // 2. Fetch team info from Slack API via Nango
    // 3. Set up webhooks for real-time updates
    console.log("Slack connection successful for user:", session.user.id, "connectionId:", connectionId);

    // Redirect back to connectors page with success
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/app-layout/${emailAccount.id}/connectors?success=slack_connected`);
  } catch (error) {
    console.error("Slack callback error:", error);
    const session = await auth();
    if (session?.user?.id) {
      const emailAccount = await prisma.emailAccount.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });
      const redirectPath = emailAccount?.id 
        ? `/app-layout/${emailAccount.id}/connectors?error=callback_failed`
        : '/login';
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}`);
    }
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);
  }
}