-- DropForeignKey
ALTER TABLE "CandidateProfile" DROP CONSTRAINT "CandidateProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoverLetter" DROP CONSTRAINT "CoverLetter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapeLog" DROP CONSTRAINT "ScrapeLog_userId_fkey";

-- DropIndex
DROP INDEX "Job_url_key";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeLog" ADD CONSTRAINT "ScrapeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
