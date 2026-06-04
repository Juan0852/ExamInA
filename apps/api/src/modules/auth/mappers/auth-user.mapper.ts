import type { AuthUserResponseDto } from "../dtos/auth-user-response.dto";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";

export class AuthUserMapper {
  static toResponse(user: AuthenticatedUserEntity): AuthUserResponseDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      role: user.role,
      status: user.status,
      profile: user.profile
        ? {
            id: user.profile.id,
            username: user.profile.username,
            bio: user.profile.bio,
            targetUniversity: user.profile.targetUniversity,
            bannerUrl: user.profile.bannerUrl,
            level: user.profile.level,
            experience: user.profile.experience,
            currentStreakDays: user.profile.currentStreakDays,
            longestStreakDays: user.profile.longestStreakDays
          }
        : null,
      preferences: user.preferences
        ? {
            id: user.preferences.id,
            preferredTheme: user.preferences.preferredTheme,
            preferredLanguage: user.preferences.preferredLanguage,
            notificationsEnabled: user.preferences.notificationsEnabled,
            studyReminderEnabled: user.preferences.studyReminderEnabled,
            timerSoundEnabled: user.preferences.timerSoundEnabled,
            defaultExamDurationSeconds: user.preferences.defaultExamDurationSeconds,
            preferredSubjects: user.preferences.preferredSubjects,
            weeklyStudyHours: user.preferences.weeklyStudyHours,
            referralSource: user.preferences.referralSource,
            onboardingCompleted: user.preferences.onboardingCompleted
          }
        : null,
      progress: user.progress
        ? {
            id: user.progress.id,
            totalQuestionsAnswered: user.progress.totalQuestionsAnswered,
            totalCorrectAnswers: user.progress.totalCorrectAnswers,
            totalExamsCompleted: user.progress.totalExamsCompleted,
            totalFlashcardsReviewed: user.progress.totalFlashcardsReviewed,
            totalStudyTimeSeconds: user.progress.totalStudyTimeSeconds,
            averageScore: user.progress.averageScore,
            level: user.progress.level,
            experience: user.progress.experience
          }
        : null
    };
  }
}
