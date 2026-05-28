import type { ExamSessionStatus } from "@prisma/client";

export type DashboardProgressRecord = {
  level: number;
  experience: number;
  totalStudyTimeSeconds: number;
  totalExamsCompleted: number;
  averageScore: number;
} | null;

export type DashboardStudyActivityRecord = {
  activityDate: Date;
  questionsAnswered: number;
  examsCompleted: number;
  studyTimeSeconds: number;
};

export type DashboardExamSessionRecord = {
  id: string;
  title: string;
  status: ExamSessionStatus;
  totalTimeSeconds: number;
  lastActivityAt: Date | null;
  updatedAt: Date;
  questions: {
    question: {
      subject: {
        name: string;
      };
    };
  }[];
  _count: {
    questions: number;
    answers: number;
  };
};

export interface DashboardRepository {
  findProgressByUserId(userId: string): Promise<DashboardProgressRecord>;
  findStudyActivitiesByRange(
    userId: string,
    from: Date,
    to: Date
  ): Promise<DashboardStudyActivityRecord[]>;
  findRecentExamSessions(userId: string, limit: number): Promise<DashboardExamSessionRecord[]>;
  findUserCreatedAt(userId: string): Promise<Date | null>;
}
