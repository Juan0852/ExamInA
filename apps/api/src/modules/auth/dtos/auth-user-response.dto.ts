export interface AuthUserResponseDto {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: string;
  status: string;
  profile: {
    id: string;
    username: string;
    bio: string | null;
    targetUniversity: string | null;
    level: number;
    experience: number;
    currentStreakDays: number;
    longestStreakDays: number;
  } | null;
  preferences: {
    id: string;
    preferredTheme: string;
    preferredLanguage: string;
    notificationsEnabled: boolean;
    studyReminderEnabled: boolean;
    timerSoundEnabled: boolean;
    defaultExamDurationSeconds: number;
    preferredSubjects: any;
    weeklyStudyHours: string | null;
    referralSource: string | null;
    onboardingCompleted: boolean;
  } | null;
  progress: {
    id: string;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    totalExamsCompleted: number;
    totalFlashcardsReviewed: number;
    totalStudyTimeSeconds: number;
    averageScore: number;
    level: number;
    experience: number;
  } | null;
}
