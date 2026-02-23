-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "resumeHighlights" TEXT[] DEFAULT ARRAY[]::TEXT[];
