import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { google } from "googleapis";
import { upsertAgendaItem } from "@/lib/connectors/agenda";
import prisma from "@/utils/prisma";

async function getGoogleCalendarClient(userId: string) {
  // Get the user's account
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("No Google access token found");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );
  
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const cal = await getGoogleCalendarClient(session.user.id);
    const events = await cal.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    let syncedCount = 0;
    for (const e of events.data.items ?? []) {
      if (!e.id || !e.summary) continue;

      await upsertAgendaItem({
        userId: session.user.id,
        source: "calendar",
        sourceId: e.id,
        title: e.summary,
        subtitle: e.location ?? e.organizer?.email ?? "",
        dueAt: e.start?.dateTime ? new Date(e.start.dateTime) : undefined,
        priority: 0,
        actionNeeded: true, // surface calendar items as actionable by default
      });
      syncedCount++;
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Successfully synced ${syncedCount} calendar events`,
      syncedCount 
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to sync calendar" 
    }, { status: 500 });
  }
}