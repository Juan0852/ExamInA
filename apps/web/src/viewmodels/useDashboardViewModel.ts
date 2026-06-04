import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../shared/services/api.service";
import {
  formatSecondsSmart,
  formatSecondsToHours,
  formatSecondsToMinutes
} from "../shared/utils/time-format";

export interface DashboardStreakDay {
  date: string;
  status: "completed" | "missed" | "pending" | "inactive";
  studySeconds: number;
}

export interface DashboardStreakMonth {
  month: string;
  days: DashboardStreakDay[];
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

interface DashboardStreakMonthsApiResponse {
  data: {
    months: DashboardStreakMonth[];
  };
  meta: {
    pageInfo?: {
      previousCursor?: string;
      hasMorePrevious?: boolean;
    }
  };
  error: any;
}

/**
 * Hook de ViewModel para DashboardPage.
 * Centraliza las peticiones a la API del panel del estudiante mediante react-query,
 * y expone formateadores y mapeadores para presentar la información en la interfaz.
 */
export function useDashboardViewModel() {
  // Query principal para el resumen del dashboard
  const summaryQuery = useQuery<DashboardSummaryApiResponse, Error>({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiService.get<DashboardSummaryApiResponse>("/dashboard/summary"),
    refetchOnMount: true
  });

  // Estado local para el cursor del mes actual en la vista de racha detallada
  const [monthCursor, setMonthCursor] = useState<string | null>(null);

  // Query secundaria para el mes de racha detallado
  const streakMonthsQuery = useQuery<DashboardStreakMonthsApiResponse, Error>({
    queryKey: ["dashboard-streak-months", monthCursor],
    queryFn: () => apiService.get<DashboardStreakMonthsApiResponse>(
      `/dashboard/streak/months?limit=1${monthCursor ? `&cursor=${monthCursor}` : ""}`
    ),
  });

  const pageInfo = streakMonthsQuery.data?.meta?.pageInfo;
  const hasMorePrevious = pageInfo?.hasMorePrevious ?? false;
  const previousCursor = pageInfo?.previousCursor;

  // Helpers para la navegación mensual
  const goToPreviousMonth = () => {
    if (hasMorePrevious && previousCursor) {
      setMonthCursor(previousCursor);
    }
  };

  const goToNextMonth = () => {
    if (!monthCursor) return; // Ya estamos en el mes más reciente
    // Calcular el mes siguiente sumando 1 al mes del cursor
    const [year, month] = monthCursor.split("-").map(Number);
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    // Formatear a YYYY-MM
    const nextCursor = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`;
    
    // Comparar con el mes actual del sistema
    const now = new Date();
    const currentMonthCursor = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    
    if (nextCursor >= currentMonthCursor) {
      setMonthCursor(null); // Volver al mes por defecto (el actual)
    } else {
      setMonthCursor(nextCursor);
    }
  };

  /**
   * Mapea el estado del día de racha para presentar en la UI (5 días de la cabecera)
   */
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

  /**
   * Formatea la fecha de última apertura a formato relativo español (ej: "Hoy", "Ayer", "Hace 2 días")
   */
  const formatRelativeDate = (dateStr: string | null): string => {
    if (!dateStr) return "Sin abrir";
    
    const date = new Date(dateStr);
    const now = new Date();
    
    // Resetear horas para comparar días calendarios limpios
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays > 1 && diffDays < 7) return `Hace ${diffDays} días`;
    return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  };

  /**
   * Traduce el estado del examen a términos visibles del alumno
   */
  const formatExamStatus = (status: DashboardRecentExam["status"]): string => {
    switch (status) {
      case "COMPLETED":
        return "Terminado";
      case "IN_PROGRESS":
        return "En progreso";
      case "DRAFT":
        return "Borrador";
      case "ABANDONED":
        return "Abandonado";
      default:
        return "Por continuar";
    }
  };

  /**
   * Formatea el mes en formato "Mes Año" para la vista de racha mensual (ej: "Enero 2026")
   */
  const formatMonthLabel = (monthKey?: string): string => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-");
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  return {
    summary: summaryQuery.data?.data || null,
    streakMonth: streakMonthsQuery.data?.data?.months?.[0] || null,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    error: summaryQuery.error?.message || null,
    refetch: () => {
      summaryQuery.refetch();
      streakMonthsQuery.refetch();
    },
    // Helpers de paginación de racha
    monthCursor,
    hasMorePrevious,
    canGoNext: monthCursor !== null,
    goToPreviousMonth,
    goToNextMonth,
    // Helpers de formato
    getMappedStreakDays,
    formatSecondsToHours,
    formatSecondsToMinutes,
    formatSecondsSmart,
    formatRelativeDate,
    formatExamStatus,
    formatMonthLabel
  };
}
