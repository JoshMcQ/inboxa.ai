ALTER TABLE "EmailAccount"
  ADD COLUMN "lastSummaryCheckAt" TIMESTAMP(3),
  ADD COLUMN "summaryPreferences" JSONB;

CREATE INDEX "EmailAccount_lastSummaryCheckAt_idx" ON "EmailAccount"("lastSummaryCheckAt");
