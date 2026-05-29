import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api.service";

export interface DashboardStreakDay {
  date: string;
  status: "completed" | "missed" | "pending" | "inactive";
  studySeconds: number;
}

export interface DashboardStudyTimePoint {
  date: string;
  studySeconds: number;
  questionsAnswered: number;
  examsCompleted: number;
}

export interface DashboardRecentExam {
  id: string;
  title: string;
  subjectName: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  progressPercentage: number;
  totalQuestions: number;
  answeredQuestions: number;
  totalTimeSeconds: number;
  lastOpenedAt: string | null;
}

export interface DashboardSummaryData {
  streak: {
    currentCount: number;
    window: DashboardStreakDay[];
  };
  studyTime: {
    weekStudySeconds: number;
    todayStudySeconds: number;
    daily: DashboardStudyTimePoint[];
  };
  recentExams: DashboardRecentExam[];
  progress: {
    level: number;
    experience: number;
    totalStudyTimeSeconds: number;
    totalExamsCompleted: number;
    averageScore: number;
  };
}

interface DashboardSummaryApiResponse {
  data: DashboardSummaryData;
  meta: any;
  error: any;
}

export function useDashboardViewModel() {
  const summaryQuery = useQuery<DashboardSummaryApiResponse, Error>({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiService.get<DashboardSummaryApiResponse>("/dashboard/summary"),
  });

  const monthStreakQuery = useQuery<any, Error>({
    queryKey: ["dashboard-streak-month", 0],
    queryFn: () => apiService.get<any>("/dashboard/streak/months?offset=0"),
  });

  const getMappedStreakDays = (windowDays?: DashboardStreakDay[]) => {
    if (!windowDays || windowDays.length === 0) return [];
    
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const todayStr = new Date().toISOString().split("T")[0];

    return windowDays.map((day) => {
      const dateObj = new Date(day.date + "T00:00:00");
      const isToday = day.date === todayStr;
      
      return {
        date: day.date,
        label: isToday ? "Hoy" : dayNames[dateObj.getDay()],
        completed: day.status === "completed",
        isToday,
        status: day.status,
      };
    });
  };

  const formatSecondsSmart = (seconds: number): string => {
    if (seconds < 60) return "< 1 min";
    if (seconds < 3600) {
      const mins = Math.round(seconds / 60);
      return `${mins} min`;
    }
    const hours = seconds / 3600;
    return `${hours.toFixed(1)} hrs`;
  };

  const formatRelativeDate = (dateStr: string | null): string => {
    if (!dateStr) return "Sin abrir";
    
    const date = new Date(dateStr);
    const now = new Date();
    
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays > 1 && diffDays < 7) return `Hace ${diffDays} días`;
    return `Hace ${Math.floor(diffDays / 7)} sem`;
  };

  const formatExamStatus = (status: DashboardRecentExam["status"]): string => {
    switch (status) {
      case "COMPLETED": return "Terminado";
      case "IN_PROGRESS": return "En progreso";
      case "DRAFT": return "Borrador";
      case "ABANDONED": return "Abandonado";
      default: return "Por continuar";
    }
  };

  return {
    summary: summaryQuery.data?.data || null,
    monthStreak: monthStreakQuery.data?.data || null,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    error: summaryQuery.error?.message || null,
    refetch: () => {
      summaryQuery.refetch();
      monthStreakQuery.refetch();
    },
    getMappedStreakDays,
    formatSecondsSmart,
    formatRelativeDate,
    formatExamStatus,
  };
}
