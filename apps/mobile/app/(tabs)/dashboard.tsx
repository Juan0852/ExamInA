import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboardViewModel } from "../../src/viewmodels/useDashboardViewModel";
import { useAuthStore } from "../../src/stores/auth.store";
import { theme } from "../../src/theme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { 
  AlertCircle, 
  Trophy, 
  Flame, 
  Check, 
  Minus, 
  X, 
  Clock, 
  FileText, 
  CalendarClock 
} from "lucide-react-native";

const GREETINGS = [
  "¡A por todas, {name}!",
  "¡Vamos a romperla hoy, {name}!",
  "Un día más cerca de tu meta, {name}.",
  "¡Concéntrate y vencerás, {name}!",
  "¿Listo para dar el máximo, {name}?",
  "El esfuerzo de hoy es tu éxito de mañana.",
  "¡A comernos el temario, {name}!",
  "¡Dale duro a esos apuntes, {name}!",
  "Tu futuro empieza hoy, {name}.",
  "¡No hay excusas que valgan, {name}!",
  "Haz que cada minuto cuente, {name}.",
  "¡A brillar en ese examen, {name}!",
  "Demuestra lo que vales, {name}.",
  "¡Con todo el power, {name}!",
  "Hoy es un buen día para aprender, {name}.",
  "¡A dar el 100%, {name}!",
  "La constancia es la clave, {name}.",
  "¡Rendirse no es opción, {name}!",
  "¡Vamos a por ese 10, {name}!",
  "Sigue adelante, {name}, lo estás haciendo genial.",
  "¡A sumar conocimientos, {name}!",
  "Tu mejor versión te espera, {name}.",
  "¡Actitud imparable, {name}!",
  "¡Cada repaso cuenta, {name}!",
  "Un pequeño paso hoy, un gran logro mañana.",
  "¡Tú puedes con esto y más, {name}!",
  "Apunta alto, {name}, el límite lo pones tú.",
  "¡Cree en ti, {name}, tienes talento!",
  "El conocimiento es poder, ¡a por él!",
  "¡Que nada te detenga, {name}!"
];

import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary, isLoading, isError, error, refetch, getMappedStreakDays, formatSecondsSmart, formatExamStatus, formatRelativeDate, monthStreak } = useDashboardViewModel();

  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [studyTimeMode, setStudyTimeMode] = useState<"total" | "average">("total");
  
  const isStreakPressed = useSharedValue(false);
  const isTimePressed = useSharedValue(false);

  const animatedStreakCardStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isStreakPressed.value ? "#f97316" : "#e2e8f0", { duration: 150 }),
      borderWidth: withTiming(isStreakPressed.value ? 2 : 1, { duration: 150 }),
      shadowColor: withTiming(isStreakPressed.value ? "#f97316" : "#000", { duration: 150 }),
      shadowOpacity: withTiming(isStreakPressed.value ? 0.2 : 0.05, { duration: 150 }),
      elevation: withTiming(isStreakPressed.value ? 6 : 2, { duration: 150 }),
    };
  });

  const animatedTimeCardStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isTimePressed.value ? "#6366f1" : "#e2e8f0", { duration: 150 }),
      borderWidth: withTiming(isTimePressed.value ? 2 : 1, { duration: 150 }),
      shadowColor: withTiming(isTimePressed.value ? "#6366f1" : "#000", { duration: 150 }),
      shadowOpacity: withTiming(isTimePressed.value ? 0.2 : 0.05, { duration: 150 }),
      elevation: withTiming(isTimePressed.value ? 6 : 2, { duration: 150 }),
    };
  });

  const greeting = useMemo(() => {
    const firstName = user?.displayName ? user.displayName.split(" ")[0] : "estudiante";
    const randomPhrase = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    return randomPhrase.replace("{name}", firstName);
  }, [user?.displayName]);

  if (isLoading && !summary) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        <Text style={styles.loadingText}>Cargando tu progreso...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={theme.colors.danger} />
        <Text style={styles.errorText}>Error al cargar estadísticas</Text>
        <Text style={styles.errorSubText}>{error || "No se pudo conectar al servidor."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const streakDays = getMappedStreakDays(summary?.streak.window);

  // Calcular el porcentaje de la línea naranja de conexión
  const completedCount = streakDays.filter(d => d.completed).length;
  // Buscamos hasta qué índice están completados secuencialmente desde la izquierda, o simplemente los completados
  // Si la racha es actual, coloreamos la línea según cuántos días seguidos hay completados
  let lastCompletedIndex = -1;
  for (let i = streakDays.length - 1; i >= 0; i--) {
    if (streakDays[i].completed) {
      lastCompletedIndex = i;
      break;
    }
  }
  const streakLineFillPercentage = streakDays.length > 1 && lastCompletedIndex > 0 
    ? (lastCompletedIndex / (streakDays.length - 1)) * 100 
    : 0;

  const monthData = monthStreak?.months?.[0] || null;
  const bestStreakCount = Math.max(
    summary?.streak.currentCount ?? 0,
    user?.profile?.longestStreakDays ?? 0
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.colors.brandBlue} />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingTitle}>{greeting}</Text>
            <Text style={styles.greetingSubtitle}>Continúa preparando tus exámenes PAU hoy.</Text>
          </View>
          <View style={styles.levelBadge}>
            <View style={styles.trophyIcon}>
              <Trophy size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.levelLabel}>Nivel actual</Text>
              <Text style={styles.levelValue}>Nivel {summary?.progress.level ?? 1}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          {/* Streak Card con Animación y Lightbox */}
          <Pressable 
            onPressIn={() => (isStreakPressed.value = true)}
            onPressOut={() => (isStreakPressed.value = false)}
            onPress={() => setStreakModalVisible(true)}
          >
            <Animated.View style={[styles.statCard, animatedStreakCardStyle]}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statTitle}>Racha de Estudio</Text>
                  <View style={styles.streakValueContainer}>
                    <Text style={styles.statValue}>{summary?.streak.currentCount ?? 0} días</Text>
                  </View>
                </View>
                <View style={[styles.statIconBadge, { backgroundColor: "#ffedd5" }]}>
                  <Flame size={24} color="#f97316" />
                </View>
              </View>
              <View style={styles.streakDaysRow}>
                {streakDays.map((day, idx) => {
                  const IconComponent = day.completed ? Check : day.status === "inactive" ? Minus : X;
                  const iconColor = day.completed ? "#f97316" : day.status === "inactive" ? "#cbd5e1" : day.status === "missed" ? "#ef4444" : "#94a3b8";
                  
                  const isLast = idx === streakDays.length - 1;
                  const nextDay = streakDays[idx + 1];
                  // Solo dibujamos línea naranja si ESTE día y el SIGUIENTE están completados
                  const connectNext = day.completed && nextDay && nextDay.completed;
                  
                  return (
                    <View key={day.date + idx} style={[styles.streakDayItem, { flex: 1 }]}>
                      {!isLast && (
                        <View style={{
                          position: "absolute",
                          top: 15, // mitad de 32 (height del circulo es 32, el borde es 2, centro = 16. top 15 + height 2 = centrado)
                          left: "50%",
                          width: "100%",
                          height: 2,
                          backgroundColor: connectNext ? "#f97316" : "#e2e8f0",
                          zIndex: -1
                        }} />
                      )}
                      <View style={[
                        styles.streakCircle, 
                        day.completed ? styles.streakCircleCompleted : 
                        day.status === "missed" ? styles.streakCircleMissed : 
                        day.status === "inactive" ? styles.streakCircleInactive : styles.streakCirclePending,
                        day.isToday && styles.streakCircleToday
                      ]}>
                        <IconComponent size={14} color={iconColor} strokeWidth={3} />
                      </View>
                      <Text style={[styles.streakDayLabel, day.isToday && { color: theme.colors.brandBlue, fontWeight: "bold" }]}>
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          </Pressable>

          {/* Time Card con Animación y Lightbox */}
          <Pressable 
            onPressIn={() => (isTimePressed.value = true)}
            onPressOut={() => (isTimePressed.value = false)}
            onPress={() => setTimeModalVisible(true)}
          >
            <Animated.View style={[styles.statCard, animatedTimeCardStyle]}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statTitle}>Tiempo Hoy</Text>
                  <Text style={styles.statValue}>{formatSecondsSmart(summary?.studyTime.todayStudySeconds ?? 0)}</Text>
                </View>
                <View style={[styles.statIconBadge, { backgroundColor: "#e0e7ff" }]}>
                  <Clock size={24} color="#6366f1" />
                </View>
              </View>
              <View style={styles.timeBreakdownRow}>
                <View style={styles.timeBreakdownBox}>
                  <Text style={styles.timeBreakdownLabel}>PROMEDIO</Text>
                  <Text style={styles.timeBreakdownValue}>
                    {(() => {
                      const daily = summary?.studyTime.daily || [];
                      const activeDays = daily.filter(d => d.studySeconds > 0).length;
                      const totalSecs = summary?.progress.totalStudyTimeSeconds ?? 0;
                      return formatSecondsSmart(activeDays > 0 ? Math.round(totalSecs / activeDays) : 0);
                    })()}
                  </Text>
                </View>
                <View style={styles.timeBreakdownBox}>
                  <Text style={styles.timeBreakdownLabel}>ACTIVO</Text>
                  <Text style={styles.timeBreakdownValue}>{formatSecondsSmart(summary?.progress.totalStudyTimeSeconds ?? 0)}</Text>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Recent Exams */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <View>
              <Text style={styles.recentTitle}>Últimos exámenes</Text>
              <Text style={styles.recentSubtitle}>Continúa tus simulacros pendientes.</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {summary?.recentExams && summary.recentExams.length > 0 ? (
            summary.recentExams.map((exam) => (
              <TouchableOpacity 
                key={exam.id} 
                style={styles.examCard} 
                activeOpacity={0.8}
                onPress={() => router.push(`/exam/${exam.id}`)}
              >
                <View style={styles.examIconContainer}>
                  <FileText size={24} color={theme.colors.brandBlue} />
                </View>
                <View style={styles.examInfo}>
                  <View style={styles.examMetaRow}>
                    <View style={[styles.statusBadge, exam.status === "COMPLETED" ? { backgroundColor: "#dcfce7" } : exam.status === "ABANDONED" ? { backgroundColor: "#fee2e2" } : {}]}>
                      <Text style={[styles.statusText, exam.status === "COMPLETED" ? { color: "#166534" } : exam.status === "ABANDONED" ? { color: "#991b1b" } : {}]}>
                        {formatExamStatus(exam.status)}
                      </Text>
                    </View>
                    <Text style={styles.subjectName}>{exam.subjectName || "General"}</Text>
                  </View>
                  <Text style={styles.examTitle} numberOfLines={1}>{exam.title}</Text>
                  
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${exam.progressPercentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{exam.progressPercentage}%</Text>
                  </View>
                  
                  <View style={styles.examFooter}>
                    <CalendarClock size={12} color="#94a3b8" />
                    <Text style={styles.examFooterText}>Última vez: {formatRelativeDate(exam.lastOpenedAt)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyExamsContainer}>
              <FileText size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyExamsTitle}>No hay exámenes recientes</Text>
              <Text style={styles.emptyExamsSubtitle}>Empieza a practicar para ver tu historial aquí.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Lightbox / Modal de Racha */}
      <Modal
        visible={streakModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStreakModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStreakModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Flame size={32} color="#f97316" />
              <Text style={styles.modalTitle}>¡Estás imparable!</Text>
            </View>
            <Text style={styles.modalDescription}>
              Llevas {summary?.streak.currentCount ?? 0} días seguidos estudiando. Mantén esta energía y lograrás la nota que necesitas.
            </Text>
            
            <View style={styles.modalStatsGrid}>
              <View style={styles.modalStatBox}>
                <Text style={styles.modalStatLabel}>Racha Actual</Text>
                <Text style={styles.modalStatValue}>{summary?.streak.currentCount ?? 0} días</Text>
              </View>
              <View style={styles.modalStatBox}>
                <Text style={styles.modalStatLabel}>Mejor Racha</Text>
                <Text style={styles.modalStatValue}>{bestStreakCount} días</Text>
              </View>
            </View>

            {/* Vista del mes actual */}
            {monthData && (
              <View style={styles.modalMonthContainer}>
                <Text style={styles.modalMonthTitle}>Actividad de este mes</Text>
                <View style={styles.modalMonthGrid}>
                  {monthData.days.map((day: any) => {
                    const isCompleted = day.status === "completed";
                    const isMissed = day.status === "missed";
                    const isPending = day.status === "pending";
                    return (
                      <View 
                        key={day.date} 
                        style={[
                          styles.modalMonthDay, 
                          isCompleted ? styles.streakCircleCompleted :
                          isMissed ? styles.streakCircleMissed :
                          isPending ? styles.streakCirclePending :
                          styles.streakCircleInactive
                        ]}
                      >
                        <Text style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: isCompleted ? "#f97316" : isMissed ? "#ef4444" : isPending ? "#cbd5e1" : "#94a3b8"
                        }}>
                          {new Date(day.date + "T00:00:00").getDate()}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setStreakModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>¡A seguir así!</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Lightbox / Modal de Tiempo */}
      <Modal
        visible={timeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTimeModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Clock size={32} color="#6366f1" />
              <Text style={[styles.modalTitle, { color: "#4f46e5" }]}>Tiempo de estudio</Text>
            </View>

            {/* Selector de Modo */}
            <View style={styles.timeToggleContainer}>
              <TouchableOpacity 
                style={[styles.timeToggleButton, studyTimeMode === "total" && styles.timeToggleButtonActive]}
                onPress={() => setStudyTimeMode("total")}
              >
                <Text style={[styles.timeToggleText, studyTimeMode === "total" && styles.timeToggleTextActive]}>Total</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.timeToggleButton, studyTimeMode === "average" && styles.timeToggleButtonActive]}
                onPress={() => setStudyTimeMode("average")}
              >
                <Text style={[styles.timeToggleText, studyTimeMode === "average" && styles.timeToggleTextActive]}>Promedio</Text>
              </TouchableOpacity>
            </View>

            {/* Gráfica de Barras de Tiempo */}
            {summary?.studyTime.daily && summary.studyTime.daily.length > 0 && (
              <View style={styles.chartContainer}>
                {summary.studyTime.daily.map((day, idx) => {
                  const maxSecs = Math.max(...summary.studyTime.daily.map(d => d.studySeconds), 1);
                  const heightPercent = Math.max(5, (day.studySeconds / maxSecs) * 100);
                  const isToday = new Date(day.date + "T00:00:00").toDateString() === new Date().toDateString();
                  const dayName = ["D", "L", "M", "X", "J", "V", "S"][new Date(day.date + "T00:00:00").getDay()];
                  
                  return (
                    <View key={day.date} style={styles.chartColumn}>
                      <View style={styles.barBackground}>
                        <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: isToday ? "#6366f1" : "#c7d2fe" }]} />
                      </View>
                      <Text style={[styles.chartDayLabel, isToday && { color: "#6366f1", fontWeight: "bold" }]}>
                        {dayName}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            
            {(() => {
              const dailyPoints = summary?.studyTime.daily || [];
              const todaySecs = summary?.studyTime.todayStudySeconds ?? 0;
              const totalSecs = summary?.studyTime.weekStudySeconds ?? 0;
              const lifetimeSecs = summary?.progress.totalStudyTimeSeconds ?? 0;
              const activeDays = dailyPoints.filter((d) => d.studySeconds > 0).length;
              const avgWeekSecs = dailyPoints.length > 0 ? Math.round(totalSecs / dailyPoints.length) : 0;
              const avgActiveSecs = activeDays > 0 ? Math.round(totalSecs / activeDays) : 0;
              
              const bestPoint = dailyPoints.reduce((best, point) => {
                if (!best || point.studySeconds > best.studySeconds) return point;
                return best;
              }, null as any);
              
              const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
              const bestDayLabel = bestPoint && bestPoint.studySeconds > 0 
                ? dayNamesShort[new Date(bestPoint.date + "T00:00:00").getDay()] 
                : "Ninguno";

              return (
                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatBoxMini}>
                    <Text style={styles.modalStatLabelMini}>{studyTimeMode === "total" ? "Hoy" : "Semanal"}</Text>
                    <Text style={[styles.modalStatValueMini, { color: "#6366f1" }]}>{studyTimeMode === "total" ? formatSecondsSmart(todaySecs) : formatSecondsSmart(avgWeekSecs)}</Text>
                  </View>
                  <View style={styles.modalStatBoxMini}>
                    <Text style={styles.modalStatLabelMini}>{studyTimeMode === "total" ? "Semana" : "Horas Activas"}</Text>
                    <Text style={[styles.modalStatValueMini, { color: "#6366f1" }]}>{studyTimeMode === "total" ? formatSecondsSmart(totalSecs) : formatSecondsSmart(avgActiveSecs)}</Text>
                  </View>
                  <View style={styles.modalStatBoxMini}>
                    <Text style={styles.modalStatLabelMini}>{studyTimeMode === "total" ? "Histórico" : "Mejor Día"}</Text>
                    <Text style={[styles.modalStatValueMini, { color: "#6366f1" }]}>{studyTimeMode === "total" ? formatSecondsSmart(lifetimeSecs) : bestDayLabel}</Text>
                  </View>
                </View>
              );
            })()}

            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: "#6366f1" }]} onPress={() => setTimeModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Genial</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 16,
    color: theme.colors.danger,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorSubText: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "column",
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignSelf: "flex-start",
  },
  trophyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  levelLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#334155",
  },
  statsRow: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  statTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  streakValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4,
  },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  streakDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  streakDayItem: {
    alignItems: "center",
    gap: 8,
  },
  streakCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  streakCircleCompleted: {
    borderColor: "#fb923c",
    backgroundColor: "#fff7ed",
  },
  streakCircleMissed: {
    borderColor: "#f87171",
    backgroundColor: "#fef2f2",
  },
  streakCircleInactive: {
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  streakCirclePending: {
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  streakCircleToday: {
    borderColor: theme.colors.brandBlue,
  },
  streakDayLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
  },
  timeBreakdownRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeBreakdownBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
  },
  timeBreakdownLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  timeBreakdownValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#334155",
    marginTop: 4,
  },
  recentSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  recentSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  seeAllText: {
    color: theme.colors.brandBlue,
    fontWeight: "bold",
    fontSize: 13,
  },
  examCard: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  examIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  examInfo: {
    flex: 1,
  },
  examMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.colors.brandBlue,
    textTransform: "uppercase",
  },
  subjectName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748b",
  },
  examTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
  },
  examFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  examFooterText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptyExamsContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyExamsTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#64748b",
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyExamsSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "500",
  },
  streakLineBackground: {
    position: "absolute",
    top: 16, 
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#e2e8f0",
    zIndex: -1,
  },
  streakLineFill: {
    position: "absolute",
    top: 16,
    left: 20,
    height: 2,
    backgroundColor: "#f97316",
    zIndex: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  modalStatBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#f97316",
    marginTop: 8,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.brandBlue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalMonthContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalMonthTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  modalMonthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  modalMonthDay: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    flexDirection: "row",
    height: 120,
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  chartColumn: {
    alignItems: "center",
    width: 24,
    height: "100%",
  },
  barBackground: {
    flex: 1,
    width: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    justifyContent: "flex-end",
    marginBottom: 8,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  chartDayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  timeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  timeToggleButtonActive: {
    backgroundColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },
  timeToggleTextActive: {
    color: "#ffffff",
  },
  modalStatBoxMini: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  modalStatLabelMini: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  modalStatValueMini: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f97316",
    marginTop: 6,
    textAlign: "center",
  },
});
