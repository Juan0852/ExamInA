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
    defaultTimerEnabled: boolean;
    defaultExamDurationSeconds: number;
  } | null;
}
