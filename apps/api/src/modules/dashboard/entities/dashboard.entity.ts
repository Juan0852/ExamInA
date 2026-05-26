import type { ExamSessionStatus } from "@prisma/client";

export type DashboardDayStatus = "completed" | "missed" | "pending" | "inactive";

export type DashboardStreakDayEntity = {
  date: string;
  status: DashboardDayStatus;
  studySeconds: number;
};

export type DashboardStreakMonthEntity = {
  month: string;
  days: DashboardStreakDayEntity[];
};

export type DashboardStudyTimePointEntity = {
  date: string;
  studySeconds: number;
  questionsAnswered: number;
  examsCompleted: number;
};

export type DashboardRecentExamEntity = {
  id: string;
  title: string;
  subjectName: string | null;
  status: ExamSessionStatus;
  progressPercentage: number;
  totalQuestions: number;
  answeredQuestions: number;
  totalTimeSeconds: number;
  lastOpenedAt: string | null;
};

export type DashboardSummaryEntity = {
  streak: {
    currentCount: number;
    window: DashboardStreakDayEntity[];
  };
  studyTime: {
    weekStudySeconds: number;
    todayStudySeconds: number;
    daily: DashboardStudyTimePointEntity[];
  };
  recentExams: DashboardRecentExamEntity[];
  progress: {
    level: number;
    experience: number;
    totalStudyTimeSeconds: number;
    totalExamsCompleted: number;
    averageScore: number;
  };
};
