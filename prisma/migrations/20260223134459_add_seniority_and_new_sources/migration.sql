-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'STAFF', 'PRINCIPAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Source" ADD VALUE 'REMOTIVE';
ALTER TYPE "Source" ADD VALUE 'HIMALAYAS';
ALTER TYPE "Source" ADD VALUE 'JOBICY';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "seniority" "Seniority";
