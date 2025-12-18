import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { getThreads } from "@/app/api/google/threads/controller";
import { threadsQuery } from "@/app/api/google/threads/validation";
import { getGmailAndAccessTokenForEmail } from "@/utils/account";

export const dynamic = "force-dynamic";

export const maxDuration = 30;

export const GET = withEmailAccount(async (request) => {
  const emailAccountId = request.auth.emailAccountId;
  
  console.log('Gmail threads API called:', {
    emailAccountId,
    userId: request.auth.userId,
    hasAuth: !!request.auth
  });

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const fromEmail = searchParams.get("fromEmail");
  const type = searchParams.get("type");
  const nextPageToken = searchParams.get("nextPageToken");
  const q = searchParams.get("q");
  const labelId = searchParams.get("labelId");
  const query = threadsQuery.parse({
    limit,
    fromEmail,
    type,
    nextPageToken,
    q,
    labelId,
  });

  const { gmail, accessToken } = await getGmailAndAccessTokenForEmail({
    emailAccountId,
  });

  console.log('Gmail token check:', {
    hasGmail: !!gmail,
    hasAccessToken: !!accessToken,
    tokenPrefix: accessToken?.slice(0, 10) + '...'
  });

  if (!accessToken) {
    console.log('No access token found - likely auth issue');
    return NextResponse.json({ 
      error: "Gmail access token not found. Please re-authenticate.", 
      isKnownError: true 
    }, { status: 401 });
  }

  const threads = await getThreads({
    query,
    emailAccountId,
    gmail,
    accessToken,
  });
  return NextResponse.json(threads);
});
