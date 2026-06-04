import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";
import { theme } from "../../src/theme";
import { UserRound, LogOut, Trophy, ChevronRight, Settings, ShieldCheck } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const profile = user?.profile;

  const handleLogout = async () => {
    await clearSession();
    router.replace("/");
  };

  // Helper para calcular el progreso del nivel (aprox)
  const calculateLevelProgress = () => {
    if (!profile) return { currentXpInLevel: 0, requiredXpForNextLevel: 100, percentage: 0 };
    const level = profile.level;
    const currentXp = profile.experience;
    
    // Formula XP base: XP = 50 * L * (L + 1) -> la diferencia entre niveles aumenta.
    // Para simplificar la UI rápida:
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

  const progress = calculateLevelProgress();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Encabezado del Perfil */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
            ) : (
              <UserRound size={40} color="#94a3b8" />
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{profile?.username || user?.displayName || "Usuario"}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            {profile?.targetUniversity && (
              <Text style={styles.universityText}>🎓 {profile.targetUniversity}</Text>
            )}
          </View>
        </View>

        {/* Tarjeta de Nivel y XP */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Trophy size={16} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={styles.levelText}>Nivel {profile?.level || 1}</Text>
            </View>
            <Text style={styles.xpText}>{profile?.experience || 0} XP Totales</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso al Nivel {(profile?.level || 1) + 1}</Text>
              <Text style={styles.progressValue}>{progress.currentXpInLevel} / {progress.requiredXpForNextLevel} XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Sección de Medallas Placeholder */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logros Destacados</Text>
            <TouchableOpacity onPress={() => router.navigate("/logros")}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.emptyMedalsCard} onPress={() => router.navigate("/logros")}>
            <ShieldCheck size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyMedalsText}>Aún no tienes medallas destacadas.</Text>
            <Text style={styles.emptyMedalsSubText}>Sigue estudiando para desbloquearlas.</Text>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  universityText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.brandBlue,
  },
  levelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#b45309",
  },
  xpText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  progressContainer: {
    width: "100%",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.brandBlue,
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 5,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.brandBlue,
  },
  emptyMedalsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyMedalsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
  },
  emptyMedalsSubText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  actionsContainer: {
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
