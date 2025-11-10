import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { getGmailAndAccessTokenForEmail } from "@/utils/account";
import { voiceSummaryQuery } from "./validation";
import { getVoiceSummary } from "./controller";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withEmailAccount(async (req) => {
  const emailAccountId = req.auth.emailAccountId;
  const { searchParams } = new URL(req.url);

  const query = voiceSummaryQuery.parse({
    query: searchParams.get("query"),
    maxResults: searchParams.get("maxResults"),
    includeCategories: searchParams.get("includeCategories"),
  });

  const { gmail, accessToken } = await getGmailAndAccessTokenForEmail({
    emailAccountId,
  });

  const result = await getVoiceSummary({
    query,
    gmail,
    accessToken: accessToken || "",
  });

  return NextResponse.json(result);
});
