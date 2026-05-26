import type {
  DashboardExamSessionRecord,
  DashboardProgressRecord,
  DashboardStudyActivityRecord
} from "../repositories/dashboard.repository";
import type {
  DashboardRecentExamEntity,
  DashboardStudyTimePointEntity
} from "../entities/dashboard.entity";

export class DashboardMapper {
  static toProgress(progress: DashboardProgressRecord) {
    return {
      level: progress?.level ?? 1,
      experience: progress?.experience ?? 0,
      totalStudyTimeSeconds: progress?.totalStudyTimeSeconds ?? 0,
      totalExamsCompleted: progress?.totalExamsCompleted ?? 0,
      averageScore: progress?.averageScore ?? 0
    };
  }

  static toStudyTimePoint(activity: DashboardStudyActivityRecord): DashboardStudyTimePointEntity {
    return {
      date: DashboardMapper.toDateKey(activity.activityDate),
      studySeconds: activity.studyTimeSeconds,
      questionsAnswered: activity.questionsAnswered,
      examsCompleted: activity.examsCompleted
    };
  }

  static toRecentExam(session: DashboardExamSessionRecord): DashboardRecentExamEntity {
    const totalQuestions = session._count.questions;
    const answeredQuestions = session._count.answers;
    const progressPercentage =
      totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return {
      id: session.id,
      title: session.title,
      subjectName: session.questions[0]?.question.subject.name ?? null,
      status: session.status,
      progressPercentage,
      totalQuestions,
      answeredQuestions,
      totalTimeSeconds: session.totalTimeSeconds,
      lastOpenedAt: (session.lastActivityAt ?? session.updatedAt).toISOString()
    };
  }

  static toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
