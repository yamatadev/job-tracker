-- Add multi-tenant userId columns (nullable first)
ALTER TABLE "Job" ADD COLUMN "userId" TEXT;
ALTER TABLE "CoverLetter" ADD COLUMN "userId" TEXT;
ALTER TABLE "ScrapeLog" ADD COLUMN "userId" TEXT;

-- Backfill existing rows to first user (dev convenience)
UPDATE "Job"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" LIMIT 1)
WHERE "userId" IS NULL;

UPDATE "CoverLetter"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" LIMIT 1)
WHERE "userId" IS NULL;

UPDATE "ScrapeLog"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" LIMIT 1)
WHERE "userId" IS NULL;

-- Make userId required
ALTER TABLE "Job" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CoverLetter" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ScrapeLog" ALTER COLUMN "userId" SET NOT NULL;

-- Drop old unique index on url (if exists) and add per-user uniqueness + indexes
ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_url_key";
CREATE UNIQUE INDEX "Job_userId_url_key" ON "Job"("userId", "url");
CREATE INDEX "Job_userId_status_idx" ON "Job"("userId", "status");
CREATE INDEX "Job_userId_source_idx" ON "Job"("userId", "source");
CREATE INDEX "Job_userId_createdAt_idx" ON "Job"("userId", "createdAt");

CREATE INDEX "CoverLetter_userId_createdAt_idx" ON "CoverLetter"("userId", "createdAt");
CREATE INDEX "ScrapeLog_userId_createdAt_idx" ON "ScrapeLog"("userId", "createdAt");

-- Foreign keys
ALTER TABLE "Job"
  ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "CoverLetter"
  ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "ScrapeLog"
  ADD CONSTRAINT "ScrapeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Candidate profile table
CREATE TABLE "CandidateProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

ALTER TABLE "CandidateProfile"
  ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
