-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'CORRECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExamSessionMode" AS ENUM ('PRACTICE', 'MOCK_EXAM', 'FLASHCARDS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ExamSessionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "CommunityPostType" AS ENUM ('TEXT', 'QUESTION', 'EXAM_RESULT', 'PROGRESS_UPDATE', 'TIP', 'DOUBT');

-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CommunityContentStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "CommunityReactionType" AS ENUM ('LIKE', 'USEFUL', 'CONGRATS', 'INTERESTING', 'SAVED');

-- CreateEnum
CREATE TYPE "UserSubjectEnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FileAssetType" AS ENUM ('IMAGE', 'PDF', 'AUDIO', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "FileAssetVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FileAssetPurpose" AS ENUM ('AVATAR', 'BANNER', 'ATTEMPT_ATTACHMENT', 'EXAM_ATTACHMENT', 'OCR_SOURCE', 'OTHER');

-- CreateEnum
CREATE TYPE "LlmReviewStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('WARNING', 'TEMPORARY_SUSPENSION', 'PERMANENT_BAN', 'ACCOUNT_RESTORED', 'CONTENT_RESTRICTION');

-- CreateEnum
CREATE TYPE "ModerationReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'EXPLICIT_CONTENT', 'IMPERSONATION', 'CHEATING', 'COPYRIGHT_VIOLATION', 'MALICIOUS_LINKS', 'INAPPROPRIATE_PROFILE', 'INAPPROPRIATE_CONTENT', 'REPEATED_RULE_VIOLATIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "SharedExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNLISTED', 'ARCHIVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "SharedExamUsageStatus" AS ENUM ('STARTED', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'COMMENT', 'SHARED_EXAM', 'USER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "UserStatus" ADD VALUE 'BANNED';
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "examSessionId" TEXT,
    "userAnswer" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrections" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "detectedErrors" JSONB,
    "missingKeywords" JSONB,
    "suggestions" JSONB,
    "recommendedTopics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" "ExamSessionMode" NOT NULL DEFAULT 'PRACTICE',
    "status" "ExamSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "durationLimitSeconds" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "resumeExpiresAt" TIMESTAMP(3),
    "totalTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_questions" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionSnapshot" JSONB NOT NULL,
    "solutionSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_answers" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "attemptId" TEXT,
    "userAnswer" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalCorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalExamsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalFlashcardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subject_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "status" "UserSubjectEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subject_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subject_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "examsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studyTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subject_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studyTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "flashcardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "examsCompleted" INTEGER NOT NULL DEFAULT 0,
    "studyTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "experienceEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_rules" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "requiredExperience" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "experienceReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileType" "FileAssetType" NOT NULL,
    "visibility" "FileAssetVisibility" NOT NULL DEFAULT 'PRIVATE',
    "purpose" "FileAssetPurpose" NOT NULL,
    "checksum" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_assets" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempt_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_session_assets" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_review_assets" (
    "id" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT,
    "examSessionId" TEXT,
    "status" "LlmReviewStatus" NOT NULL DEFAULT 'PENDING',
    "extractedText" TEXT,
    "llmInputSnapshot" JSONB,
    "llmOutputSnapshot" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "llm_review_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_moderation_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT,
    "action" "ModerationActionType" NOT NULL,
    "reason" "ModerationReason" NOT NULL,
    "notes" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "CommunityPostType" NOT NULL DEFAULT 'TEXT',
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "examSessionId" TEXT,
    "sharedExamId" TEXT,
    "status" "CommunityContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommunityContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "type" "CommunityReactionType" NOT NULL DEFAULT 'LIKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_exams" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sourceExamSessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "SharedExamStatus" NOT NULL DEFAULT 'DRAFT',
    "allowCloning" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_exam_usages" (
    "id" TEXT NOT NULL,
    "sharedExamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examSessionId" TEXT,
    "status" "SharedExamUsageStatus" NOT NULL DEFAULT 'STARTED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_exam_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_exam_questions" (
    "id" TEXT NOT NULL,
    "sharedExamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionSnapshot" JSONB NOT NULL,
    "solutionSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "sharedExamId" TEXT,
    "reportedUserId" TEXT,
    "reason" "ModerationReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attempts_userId_idx" ON "attempts"("userId");

-- CreateIndex
CREATE INDEX "attempts_questionId_idx" ON "attempts"("questionId");

-- CreateIndex
CREATE INDEX "attempts_examSessionId_idx" ON "attempts"("examSessionId");

-- CreateIndex
CREATE INDEX "attempts_status_idx" ON "attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "corrections_attemptId_key" ON "corrections"("attemptId");

-- CreateIndex
CREATE INDEX "exam_sessions_userId_idx" ON "exam_sessions"("userId");

-- CreateIndex
CREATE INDEX "exam_sessions_status_idx" ON "exam_sessions"("status");

-- CreateIndex
CREATE INDEX "exam_sessions_lastActivityAt_idx" ON "exam_sessions"("lastActivityAt");

-- CreateIndex
CREATE INDEX "exam_session_questions_questionId_idx" ON "exam_session_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_questions_examSessionId_order_key" ON "exam_session_questions"("examSessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_questions_examSessionId_questionId_key" ON "exam_session_questions"("examSessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_answers_attemptId_key" ON "exam_session_answers"("attemptId");

-- CreateIndex
CREATE INDEX "exam_session_answers_questionId_idx" ON "exam_session_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_answers_examSessionId_questionId_key" ON "exam_session_answers"("examSessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "user_subject_enrollments_subjectId_idx" ON "user_subject_enrollments"("subjectId");

-- CreateIndex
CREATE INDEX "user_subject_enrollments_status_idx" ON "user_subject_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_subject_enrollments_userId_subjectId_key" ON "user_subject_enrollments"("userId", "subjectId");

-- CreateIndex
CREATE INDEX "user_subject_progress_subjectId_idx" ON "user_subject_progress"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subject_progress_userId_subjectId_key" ON "user_subject_progress"("userId", "subjectId");

-- CreateIndex
CREATE INDEX "user_topic_progress_topicId_idx" ON "user_topic_progress"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "user_topic_progress_userId_topicId_key" ON "user_topic_progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "study_activities_activityDate_idx" ON "study_activities"("activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "study_activities_userId_activityDate_key" ON "study_activities"("userId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "level_rules_level_key" ON "level_rules"("level");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "user_achievements_achievementId_idx" ON "user_achievements"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "file_assets_userId_idx" ON "file_assets"("userId");

-- CreateIndex
CREATE INDEX "file_assets_purpose_idx" ON "file_assets"("purpose");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_bucket_key_key" ON "file_assets"("bucket", "key");

-- CreateIndex
CREATE INDEX "attempt_assets_fileAssetId_idx" ON "attempt_assets"("fileAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_assets_attemptId_fileAssetId_key" ON "attempt_assets"("attemptId", "fileAssetId");

-- CreateIndex
CREATE INDEX "exam_session_assets_fileAssetId_idx" ON "exam_session_assets"("fileAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_assets_examSessionId_fileAssetId_key" ON "exam_session_assets"("examSessionId", "fileAssetId");

-- CreateIndex
CREATE INDEX "llm_review_assets_fileAssetId_idx" ON "llm_review_assets"("fileAssetId");

-- CreateIndex
CREATE INDEX "llm_review_assets_userId_idx" ON "llm_review_assets"("userId");

-- CreateIndex
CREATE INDEX "llm_review_assets_attemptId_idx" ON "llm_review_assets"("attemptId");

-- CreateIndex
CREATE INDEX "llm_review_assets_examSessionId_idx" ON "llm_review_assets"("examSessionId");

-- CreateIndex
CREATE INDEX "llm_review_assets_status_idx" ON "llm_review_assets"("status");

-- CreateIndex
CREATE INDEX "friendships_receiverId_idx" ON "friendships"("receiverId");

-- CreateIndex
CREATE INDEX "friendships_status_idx" ON "friendships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_requesterId_receiverId_key" ON "friendships"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "user_moderation_actions_userId_idx" ON "user_moderation_actions"("userId");

-- CreateIndex
CREATE INDEX "user_moderation_actions_moderatorId_idx" ON "user_moderation_actions"("moderatorId");

-- CreateIndex
CREATE INDEX "user_moderation_actions_action_idx" ON "user_moderation_actions"("action");

-- CreateIndex
CREATE INDEX "user_moderation_actions_reason_idx" ON "user_moderation_actions"("reason");

-- CreateIndex
CREATE INDEX "community_posts_authorId_idx" ON "community_posts"("authorId");

-- CreateIndex
CREATE INDEX "community_posts_examSessionId_idx" ON "community_posts"("examSessionId");

-- CreateIndex
CREATE INDEX "community_posts_sharedExamId_idx" ON "community_posts"("sharedExamId");

-- CreateIndex
CREATE INDEX "community_posts_status_idx" ON "community_posts"("status");

-- CreateIndex
CREATE INDEX "community_posts_createdAt_idx" ON "community_posts"("createdAt");

-- CreateIndex
CREATE INDEX "community_comments_postId_idx" ON "community_comments"("postId");

-- CreateIndex
CREATE INDEX "community_comments_authorId_idx" ON "community_comments"("authorId");

-- CreateIndex
CREATE INDEX "community_comments_parentCommentId_idx" ON "community_comments"("parentCommentId");

-- CreateIndex
CREATE INDEX "community_comments_status_idx" ON "community_comments"("status");

-- CreateIndex
CREATE INDEX "community_reactions_postId_idx" ON "community_reactions"("postId");

-- CreateIndex
CREATE INDEX "community_reactions_commentId_idx" ON "community_reactions"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "community_reactions_userId_postId_type_key" ON "community_reactions"("userId", "postId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "community_reactions_userId_commentId_type_key" ON "community_reactions"("userId", "commentId", "type");

-- CreateIndex
CREATE INDEX "shared_exams_ownerId_idx" ON "shared_exams"("ownerId");

-- CreateIndex
CREATE INDEX "shared_exams_sourceExamSessionId_idx" ON "shared_exams"("sourceExamSessionId");

-- CreateIndex
CREATE INDEX "shared_exams_visibility_idx" ON "shared_exams"("visibility");

-- CreateIndex
CREATE INDEX "shared_exams_status_idx" ON "shared_exams"("status");

-- CreateIndex
CREATE INDEX "shared_exam_usages_sharedExamId_idx" ON "shared_exam_usages"("sharedExamId");

-- CreateIndex
CREATE INDEX "shared_exam_usages_userId_idx" ON "shared_exam_usages"("userId");

-- CreateIndex
CREATE INDEX "shared_exam_usages_examSessionId_idx" ON "shared_exam_usages"("examSessionId");

-- CreateIndex
CREATE INDEX "shared_exam_usages_status_idx" ON "shared_exam_usages"("status");

-- CreateIndex
CREATE INDEX "shared_exam_questions_questionId_idx" ON "shared_exam_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_exam_questions_sharedExamId_order_key" ON "shared_exam_questions"("sharedExamId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "shared_exam_questions_sharedExamId_questionId_key" ON "shared_exam_questions"("sharedExamId", "questionId");

-- CreateIndex
CREATE INDEX "content_reports_reporterId_idx" ON "content_reports"("reporterId");

-- CreateIndex
CREATE INDEX "content_reports_postId_idx" ON "content_reports"("postId");

-- CreateIndex
CREATE INDEX "content_reports_commentId_idx" ON "content_reports"("commentId");

-- CreateIndex
CREATE INDEX "content_reports_sharedExamId_idx" ON "content_reports"("sharedExamId");

-- CreateIndex
CREATE INDEX "content_reports_reportedUserId_idx" ON "content_reports"("reportedUserId");

-- CreateIndex
CREATE INDEX "content_reports_status_idx" ON "content_reports"("status");

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_questions" ADD CONSTRAINT "exam_session_questions_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_questions" ADD CONSTRAINT "exam_session_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_answers" ADD CONSTRAINT "exam_session_answers_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_answers" ADD CONSTRAINT "exam_session_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_answers" ADD CONSTRAINT "exam_session_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_enrollments" ADD CONSTRAINT "user_subject_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_enrollments" ADD CONSTRAINT "user_subject_enrollments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_activities" ADD CONSTRAINT "study_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_assets" ADD CONSTRAINT "attempt_assets_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_assets" ADD CONSTRAINT "attempt_assets_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "file_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_assets" ADD CONSTRAINT "exam_session_assets_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session_assets" ADD CONSTRAINT "exam_session_assets_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "file_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_review_assets" ADD CONSTRAINT "llm_review_assets_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "file_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_review_assets" ADD CONSTRAINT "llm_review_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_review_assets" ADD CONSTRAINT "llm_review_assets_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_review_assets" ADD CONSTRAINT "llm_review_assets_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_moderation_actions" ADD CONSTRAINT "user_moderation_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_moderation_actions" ADD CONSTRAINT "user_moderation_actions_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_sharedExamId_fkey" FOREIGN KEY ("sharedExamId") REFERENCES "shared_exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exams" ADD CONSTRAINT "shared_exams_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exams" ADD CONSTRAINT "shared_exams_sourceExamSessionId_fkey" FOREIGN KEY ("sourceExamSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exam_usages" ADD CONSTRAINT "shared_exam_usages_sharedExamId_fkey" FOREIGN KEY ("sharedExamId") REFERENCES "shared_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exam_usages" ADD CONSTRAINT "shared_exam_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exam_usages" ADD CONSTRAINT "shared_exam_usages_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exam_questions" ADD CONSTRAINT "shared_exam_questions_sharedExamId_fkey" FOREIGN KEY ("sharedExamId") REFERENCES "shared_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_exam_questions" ADD CONSTRAINT "shared_exam_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_sharedExamId_fkey" FOREIGN KEY ("sharedExamId") REFERENCES "shared_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
