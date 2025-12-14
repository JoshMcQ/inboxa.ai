import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { voiceSummaryQuery } from "./validation";
import { getVoiceSummary } from "./controller";
import prisma from "@/utils/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 10; // Reduced from 30s - database queries are much faster

export const GET = withEmailAccount(async (req) => {
  const emailAccountId = req.auth.emailAccountId;
  const { searchParams } = new URL(req.url);

  const query = voiceSummaryQuery.parse({
    query: searchParams.get("query"),
    maxResults: searchParams.get("maxResults"),
    includeCategories: searchParams.get("includeCategories"),
    fromEmail: searchParams.get("fromEmail"),
  });

  const result = await getVoiceSummary({
    query,
    emailAccountId,
  });

  return NextResponse.json(result);
});
