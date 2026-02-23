-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "resumeFileName" TEXT,
ADD COLUMN     "resumeMime" TEXT,
ADD COLUMN     "resumeText" TEXT,
ADD COLUMN     "resumeUpdatedAt" TIMESTAMP(3);
