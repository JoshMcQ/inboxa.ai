import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Nango OAuth integration for Slack
    const nangoPublicKey = process.env.NANGO_PUBLIC_KEY;
    const nangoSecretKey = process.env.NANGO_SECRET_KEY;
    
    if (!nangoPublicKey || !nangoSecretKey) {
      return NextResponse.json({ error: "Nango configuration missing" }, { status: 500 });
    }

    // Generate Nango OAuth URL for Slack
    const connectionId = `slack_${session.user.id}`;
    const redirectUrl = `${process.env.NEXTAUTH_URL}/api/nango/slack/callback`;
    
    const nangoAuthUrl = `https://api.nango.dev/oauth/connect/slack?connection_id=${connectionId}&redirect_uri=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.redirect(nangoAuthUrl);
  } catch (error) {
    console.error("Slack auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}