import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";
import { theme } from "../../src/theme";
import { 
  UserRound, LogOut, Trophy, ChevronRight, Settings, 
  Flame, Zap, BookOpen, Target, Clock, Lock, Award
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const profile = user?.profile;
  const progress = user?.progress;

  const handleLogout = async () => {
    await clearSession();
    router.replace("/");
  };

  // Helper para calcular el progreso del nivel (aprox)
  const calculateLevelProgress = () => {
    if (!profile) return { currentXpInLevel: 0, requiredXpForNextLevel: 100, percentage: 0 };
    const level = profile.level;
    const currentXp = profile.experience;
    
    // Formula XP base: XP = 50 * L * (L + 1)
    const xpForCurrentLevel = 50 * level * (level - 1);
    const xpForNextLevel = 50 * level * (level + 1);
    
    const xpInCurrentLevel = currentXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    
    const percentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));
    
    return {
      currentXpInLevel: xpInCurrentLevel,
      requiredXpForNextLevel: xpNeeded,
      percentage
    };
  };

  const levelProgress = calculateLevelProgress();

  const hitRate = progress?.totalQuestionsAnswered 
    ? Math.round((progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100) 
    : 0;

  const studyTimeHours = progress?.totalStudyTimeSeconds 
    ? Math.floor(progress.totalStudyTimeSeconds / 3600) 
    : 0;
    
  const studyTimeMins = progress?.totalStudyTimeSeconds 
    ? Math.floor((progress.totalStudyTimeSeconds % 3600) / 60) 
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section (Banner + Avatar) */}
        <View style={styles.heroSection}>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
          </View>
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
              ) : (
                <UserRound size={48} color="#94a3b8" />
              )}
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{profile?.username || user?.displayName || "Usuario"}</Text>
            {profile?.targetUniversity && (
              <Text style={styles.universityText}>🎓 {profile.targetUniversity}</Text>
            )}
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* Level Progress Bar */}
        <View style={styles.levelProgressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso al Nivel {(profile?.level || 1) + 1}</Text>
            <Text style={styles.progressValue}>{levelProgress.currentXpInLevel} / {levelProgress.requiredXpForNextLevel} XP</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${levelProgress.percentage}%` }]} />
          </View>
        </View>

        {/* Core Stats Row */}
        <View style={styles.coreStatsRow}>
          <View style={styles.coreStatCard}>
            <View style={[styles.coreStatIconBg, { backgroundColor: "#fff1f2" }]}>
              <Flame size={24} color="#e11d48" />
            </View>
            <Text style={styles.coreStatValue}>{profile?.currentStreakDays || 0}</Text>
            <Text style={styles.coreStatLabel}>Días Seguidos</Text>
          </View>
          
          <View style={styles.coreStatCard}>
            <View style={[styles.coreStatIconBg, { backgroundColor: "#fef3c7" }]}>
              <Zap size={24} color="#d97706" />
            </View>
            <Text style={styles.coreStatValue}>{profile?.experience || 0}</Text>
            <Text style={styles.coreStatLabel}>Total XP</Text>
          </View>

          <View style={styles.coreStatCard}>
            <View style={[styles.coreStatIconBg, { backgroundColor: "#eff6ff" }]}>
              <Trophy size={24} color="#2563eb" />
            </View>
            <Text style={styles.coreStatValue}>{profile?.level || 1}</Text>
            <Text style={styles.coreStatLabel}>Nivel Actual</Text>
          </View>
        </View>

        {/* Medals & Achievements (Locked View) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Medallas</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medalsCarousel}>
            {/* Medalla 1 */}
            <View style={styles.medalCard}>
              <View style={styles.medalIconLocked}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <Text style={styles.medalTitleLocked}>Primera Racha</Text>
              <Text style={styles.medalDescLocked}>3 días seguidos</Text>
            </View>

            {/* Medalla 2 */}
            <View style={styles.medalCard}>
              <View style={styles.medalIconLocked}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <Text style={styles.medalTitleLocked}>Erudito</Text>
              <Text style={styles.medalDescLocked}>100 preguntas</Text>
            </View>

            {/* Medalla 3 */}
            <View style={styles.medalCard}>
              <View style={styles.medalIconLocked}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <Text style={styles.medalTitleLocked}>Imparable</Text>
              <Text style={styles.medalDescLocked}>Nivel 10</Text>
            </View>

            {/* Medalla 4 */}
            <View style={styles.medalCard}>
              <View style={styles.medalIconLocked}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <Text style={styles.medalTitleLocked}>Francotirador</Text>
              <Text style={styles.medalDescLocked}>100% acierto</Text>
            </View>
          </ScrollView>
        </View>

        {/* Detailed Study Stats */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estadísticas de Estudio</Text>
          </View>
          
          <View style={styles.statsGrid}>
            {/* Stat 1 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <BookOpen size={18} color="#0ea5e9" />
                <Text style={styles.detailedStatTitle}>Exámenes</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{progress?.totalExamsCompleted || 0}</Text>
              <Text style={styles.detailedStatDesc}>completados</Text>
            </View>

            {/* Stat 2 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <Target size={18} color="#10b981" />
                <Text style={styles.detailedStatTitle}>Precisión</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{hitRate}%</Text>
              <Text style={styles.detailedStatDesc}>{progress?.totalCorrectAnswers || 0} aciertos</Text>
            </View>

            {/* Stat 3 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <Clock size={18} color="#8b5cf6" />
                <Text style={styles.detailedStatTitle}>Tiempo</Text>
              </View>
              <Text style={styles.detailedStatNumber}>
                {studyTimeHours > 0 ? `${studyTimeHours}h ` : ""}{studyTimeMins}m
              </Text>
              <Text style={styles.detailedStatDesc}>estudiando</Text>
            </View>

            {/* Stat 4 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <Award size={18} color="#f59e0b" />
                <Text style={styles.detailedStatTitle}>Flashcards</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{progress?.totalFlashcardsReviewed || 0}</Text>
              <Text style={styles.detailedStatDesc}>repasadas</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Settings size={20} color="#64748b" />
            </View>
            <Text style={styles.actionText}>Configuración de la cuenta</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  
  // Hero Section
  heroSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  banner: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.brandBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarWrapper: {
    marginTop: -50,
    padding: 6,
    backgroundColor: "#ffffff",
    borderRadius: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  userInfo: {
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  universityText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.brandBlue,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: "#64748b",
  },

  // Level Progress Bar
  levelProgressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.brandBlue,
  },
  progressBarBg: {
    width: "100%",
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 6,
  },

  // Core Stats
  coreStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  coreStatCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  coreStatIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  coreStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  coreStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },

  // Sections Common
  sectionContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },

  // Medals Carousel
  medalsCarousel: {
    paddingRight: 20, // For end spacing
    gap: 16,
  },
  medalCard: {
    width: 110,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  medalIconLocked: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  medalTitleLocked: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  medalDescLocked: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
  },

  // Detailed Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailedStatCard: {
    width: (width - 40 - 12) / 2, // Half width minus padding and gap
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  detailedStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  detailedStatTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  detailedStatNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
  },
  detailedStatDesc: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fca5a5",
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ef4444",
  },
});
