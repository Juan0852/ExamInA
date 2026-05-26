-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "weeklyStudyHours" TEXT;
