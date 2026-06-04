import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import { DashboardMapper } from "../mappers/dashboard.mapper";
import type {
  DashboardStreakDayEntity,
  DashboardStreakMonthEntity,
  DashboardStudyTimePointEntity
} from "../entities/dashboard.entity";
import type {
  DashboardRecentExamsResponseDto,
  DashboardStreakMonthsResponseDto,
  DashboardStudyTimeResponseDto,
  DashboardSummaryResponseDto
} from "../dtos/dashboard-response.dto";
import type { StreakMonthsQueryDto } from "../dtos/streak-months-query.dto";
import type { StudyTimeQueryDto } from "../dtos/study-time-query.dto";
import type { DashboardRepository, DashboardStudyActivityRecord } from "../repositories/dashboard.repository";

export const DASHBOARD_REPOSITORY = Symbol("DASHBOARD_REPOSITORY");

const ACTIVE_STUDY_SECONDS_THRESHOLD = 60;

@Injectable()
export class DashboardService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository
  ) {}

  async getSummary(authorizationHeader?: string): Promise<DashboardSummaryResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const today = this.startOfDay(new Date());
    const windowFrom = this.addDays(today, -2);
    const windowTo = this.addDays(today, 2);
    const weekFrom = this.startOfWeek(today);

    const [progress, streakActivities, weeklyActivities, recentExamSessions, userCreatedAt] =
      await Promise.all([
        this.dashboardRepository.findProgressByUserId(user.id),
        this.dashboardRepository.findStudyActivitiesByRange(user.id, this.addDays(today, -60), today),
        this.dashboardRepository.findStudyActivitiesByRange(user.id, weekFrom, today),
        this.dashboardRepository.findRecentExamSessions(user.id, 10),
        this.dashboardRepository.findUserCreatedAt(user.id)
      ]);

    const streakActivityMap = this.toActivityMap(streakActivities);
    const weeklyDaily = this.fillStudyTimeRange(weekFrom, today, weeklyActivities);
    const todayKey = this.toDateKey(today);
    const todayActivity = weeklyDaily.find((day) => day.date === todayKey);
    const accountStartedAt = userCreatedAt ? this.startOfDay(userCreatedAt) : null;

    return {
      data: {
        streak: {
          currentCount: this.calculateCurrentStreak(today, streakActivityMap),
          window: this.buildStreakWindow(windowFrom, windowTo, streakActivityMap, today, accountStartedAt)
        },
        studyTime: {
          weekStudySeconds: weeklyDaily.reduce((total, day) => total + day.studySeconds, 0),
          todayStudySeconds: todayActivity?.studySeconds ?? 0,
          daily: weeklyDaily
        },
        recentExams: recentExamSessions.map(DashboardMapper.toRecentExam),
        progress: DashboardMapper.toProgress(progress)
      },
      meta: {},
      error: null
    };
  }

  async getStreakMonths(
    query: StreakMonthsQueryDto,
    authorizationHeader?: string
  ): Promise<DashboardStreakMonthsResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const cursorDate = query.cursor ? this.monthFromCursor(query.cursor) : this.startOfMonth(new Date());
    const oldestMonth = this.addMonths(cursorDate, -(query.limit - 1));
    const newestMonth = cursorDate;
    const from = this.startOfMonth(oldestMonth);
    const to = this.endOfMonth(newestMonth);
    const [activities, userCreatedAt] = await Promise.all([
      this.dashboardRepository.findStudyActivitiesByRange(user.id, from, to),
      this.dashboardRepository.findUserCreatedAt(user.id)
    ]);
    const activityMap = this.toActivityMap(activities);
    const accountStartedAt = userCreatedAt ? this.startOfDay(userCreatedAt) : null;
    const months: DashboardStreakMonthEntity[] = [];

    for (let index = 0; index < query.limit; index += 1) {
      const monthDate = this.addMonths(newestMonth, -index);
      months.push({
        month: this.toMonthKey(monthDate),
        days: this.buildMonthDays(monthDate, activityMap, accountStartedAt)
      });
    }

    const previousCursorDate = this.addMonths(oldestMonth, -1);
    const previousCursor = this.toMonthKey(previousCursorDate);
    
    let hasMorePrevious = false;
    if (userCreatedAt) {
      const userCreationMonth = this.startOfMonth(userCreatedAt);
      hasMorePrevious = previousCursorDate.getTime() >= userCreationMonth.getTime();
    }

    return {
      data: {
        months
      },
      meta: {
        pageInfo: {
          previousCursor,
          hasMorePrevious,
          nextCursor: null,
          hasMoreNext: false
        }
      },
      error: null
    };
  }

  async getStudyTime(
    query: StudyTimeQueryDto,
    authorizationHeader?: string
  ): Promise<DashboardStudyTimeResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const from = this.dateFromKey(query.from);
    const to = this.dateFromKey(query.to);
    const activities = await this.dashboardRepository.findStudyActivitiesByRange(user.id, from, to);
    const days = this.fillStudyTimeRange(from, to, activities);
    const totalStudySeconds = days.reduce((total, day) => total + day.studySeconds, 0);
    const activeDaysCount = days.filter((d) => d.studySeconds > 0).length;
    const bestDay = days.reduce<DashboardStudyTimePointEntity | null>((best, day) => {
      if (!best || day.studySeconds > best.studySeconds) {
        return day;
      }

      return best;
    }, null);

    return {
      data: {
        totalStudySeconds,
        averageDailyStudySeconds: activeDaysCount > 0 ? Math.round(totalStudySeconds / activeDaysCount) : 0,
        bestDay,
        days
      },
      meta: {
        range: {
          from: query.from,
          to: query.to
        }
      },
      error: null
    };
  }

  async getRecentExams(authorizationHeader?: string): Promise<DashboardRecentExamsResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const limit = 10;
    const recentExamSessions = await this.dashboardRepository.findRecentExamSessions(user.id, limit);

    return {
      data: recentExamSessions.map(DashboardMapper.toRecentExam),
      meta: {
        total: recentExamSessions.length,
        limit
      },
      error: null
    };
  }

  private buildStreakWindow(
    from: Date,
    to: Date,
    activityMap: Map<string, DashboardStudyActivityRecord>,
    today: Date,
    accountStartedAt: Date | null
  ): DashboardStreakDayEntity[] {
    const days: DashboardStreakDayEntity[] = [];

    for (let day = new Date(from); day <= to; day = this.addDays(day, 1)) {
      days.push(this.toStreakDay(day, activityMap, today, accountStartedAt));
    }

    return days;
  }

  private buildMonthDays(
    monthDate: Date,
    activityMap: Map<string, DashboardStudyActivityRecord>,
    accountStartedAt: Date | null
  ): DashboardStreakDayEntity[] {
    const today = this.startOfDay(new Date());
    const from = this.startOfMonth(monthDate);
    const to = this.endOfMonth(monthDate);
    const days: DashboardStreakDayEntity[] = [];

    for (let day = new Date(from); day <= to; day = this.addDays(day, 1)) {
      days.push(this.toStreakDay(day, activityMap, today, accountStartedAt));
    }

    return days;
  }

  private fillStudyTimeRange(
    from: Date,
    to: Date,
    activities: DashboardStudyActivityRecord[]
  ): DashboardStudyTimePointEntity[] {
    const activityMap = this.toActivityMap(activities);
    const days: DashboardStudyTimePointEntity[] = [];

    for (let day = new Date(from); day <= to; day = this.addDays(day, 1)) {
      const date = this.toDateKey(day);
      const activity = activityMap.get(date);

      days.push(
        activity
          ? DashboardMapper.toStudyTimePoint(activity)
          : {
              date,
              studySeconds: 0,
              questionsAnswered: 0,
              examsCompleted: 0
            }
      );
    }

    return days;
  }

  private calculateCurrentStreak(
    today: Date,
    activityMap: Map<string, DashboardStudyActivityRecord>
  ): number {
    let count = 0;
    let cursor = this.hasCompletedActivity(activityMap.get(this.toDateKey(today)))
      ? today
      : this.addDays(today, -1);

    for (let index = 0; index < 60; index += 1) {
      const activity = activityMap.get(this.toDateKey(cursor));

      if (!this.hasCompletedActivity(activity)) {
        break;
      }

      count += 1;
      cursor = this.addDays(cursor, -1);
    }

    return count;
  }

  private toStreakDay(
    day: Date,
    activityMap: Map<string, DashboardStudyActivityRecord>,
    today: Date,
    accountStartedAt: Date | null
  ): DashboardStreakDayEntity {
    const activity = activityMap.get(this.toDateKey(day));
    const studySeconds = activity?.studyTimeSeconds ?? 0;

    if (accountStartedAt && day < accountStartedAt) {
      return {
        date: this.toDateKey(day),
        status: "inactive",
        studySeconds
      };
    }

    if (this.hasCompletedActivity(activity)) {
      return {
        date: this.toDateKey(day),
        status: "completed",
        studySeconds
      };
    }

    if (day > today) {
      return {
        date: this.toDateKey(day),
        status: "pending",
        studySeconds
      };
    }

    return {
      date: this.toDateKey(day),
      status: day.getTime() === today.getTime() ? "pending" : "missed",
      studySeconds
    };
  }

  private hasCompletedActivity(activity?: DashboardStudyActivityRecord): boolean {
    if (!activity) {
      return false;
    }

    return (
      activity.studyTimeSeconds >= ACTIVE_STUDY_SECONDS_THRESHOLD ||
      activity.questionsAnswered > 0 ||
      activity.examsCompleted > 0
    );
  }

  private toActivityMap(
    activities: DashboardStudyActivityRecord[]
  ): Map<string, DashboardStudyActivityRecord> {
    return new Map(activities.map((activity) => [this.toDateKey(activity.activityDate), activity]));
  }

  private startOfWeek(date: Date): Date {
    const day = this.startOfDay(date);
    const dayOfWeek = day.getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return this.addDays(day, -daysSinceMonday);
  }

  private startOfMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  private endOfMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  }

  private startOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);

    return nextDate;
  }

  private addMonths(date: Date, months: number): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  }

  private dateFromKey(dateKey: string): Date {
    return new Date(`${dateKey}T00:00:00.000Z`);
  }

  private monthFromCursor(cursor: string): Date {
    return new Date(`${cursor}-01T00:00:00.000Z`);
  }

  private toDateKey(date: Date): string {
    return DashboardMapper.toDateKey(date);
  }

  private toMonthKey(date: Date): string {
    return date.toISOString().slice(0, 7);
  }
}
