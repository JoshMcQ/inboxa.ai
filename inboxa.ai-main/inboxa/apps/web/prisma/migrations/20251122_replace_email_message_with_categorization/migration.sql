-- Drop old EmailMessage table
DROP TABLE IF EXISTS "EmailMessage" CASCADE;

-- Create new lightweight EmailCategorization table
CREATE TABLE "EmailCategorization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "priority" TEXT,
    "category" TEXT,
    "reasoning" TEXT,
    "emailAccountId" TEXT NOT NULL,

    CONSTRAINT "EmailCategorization_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "EmailCategorization_emailAccountId_messageId_key" ON "EmailCategorization"("emailAccountId", "messageId");
CREATE INDEX "EmailCategorization_emailAccountId_threadId_idx" ON "EmailCategorization"("emailAccountId", "threadId");
CREATE INDEX "EmailCategorization_emailAccountId_date_idx" ON "EmailCategorization"("emailAccountId", "date");
CREATE INDEX "EmailCategorization_emailAccountId_priority_idx" ON "EmailCategorization"("emailAccountId", "priority");
CREATE INDEX "EmailCategorization_emailAccountId_date_priority_idx" ON "EmailCategorization"("emailAccountId", "date", "priority");

-- Add foreign key
ALTER TABLE "EmailCategorization" ADD CONSTRAINT "EmailCategorization_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
