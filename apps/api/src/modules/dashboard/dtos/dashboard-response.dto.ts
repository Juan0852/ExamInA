import type {
  DashboardRecentExamEntity,
  DashboardStreakDayEntity,
  DashboardStreakMonthEntity,
  DashboardStudyTimePointEntity,
  DashboardSummaryEntity
} from "../entities/dashboard.entity";

export type DashboardSummaryResponseDto = {
  data: DashboardSummaryEntity;
  meta: {};
  error: null;
};

export type DashboardStreakMonthsResponseDto = {
  data: {
    months: DashboardStreakMonthEntity[];
  };
  meta: {
    pageInfo: {
      previousCursor: string | null;
      hasMorePrevious: boolean;
    };
  };
  error: null;
};

export type DashboardStudyTimeResponseDto = {
  data: {
    totalStudySeconds: number;
    averageDailyStudySeconds: number;
    bestDay: DashboardStudyTimePointEntity | null;
    days: DashboardStudyTimePointEntity[];
  };
  meta: {
    range: {
      from: string;
      to: string;
    };
  };
  error: null;
};

export type DashboardRecentExamsResponseDto = {
  data: DashboardRecentExamEntity[];
  meta: {
    total: number;
    limit: number;
  };
  error: null;
};

export type DashboardStreakWindowResponseDto = {
  data: DashboardStreakDayEntity[];
  meta: {};
  error: null;
};
