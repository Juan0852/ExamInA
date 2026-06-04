import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";
import { theme } from "../../src/theme";
import { 
  UserRound, LogOut, ChevronRight, Settings, Lock, Trophy, CalendarDays, Users, MessageSquare, Sparkles, Globe, Heart
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../src/services/api.service";
import { 
  FlameIcon, LightningIcon, TrophyIcon, BookIcon, TargetIcon, ClockIcon, AwardIcon 
} from "../../src/components/icons/CustomIcons";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const profile = user?.profile;
  const progress = user?.progress;
  const [activeTab, setActiveTab] = useState<"ACHIEVEMENTS" | "EXAMS" | "FRIENDS" | "POSTS">("ACHIEVEMENTS");
  const queryClient = useQueryClient();

  const myExamsQuery = useQuery({
    queryKey: ["my-exams"],
    queryFn: () => apiService.get<{ data: any[] }>("/shared-exams/me"),
    enabled: !!user
  });

  const myPostsQuery = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => apiService.get<{ data: any[] }>("/community/posts/me"),
    enabled: !!user
  });

  const myFriendsQuery = useQuery({
    queryKey: ["my-friends"],
    queryFn: () => apiService.get<{ data: any[] }>("/auth/friends"),
    enabled: !!user
  });

  const handleToggleVisibility = async (examId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === "PRIVATE" ? "PUBLIC" : "PRIVATE";
    try {
      await apiService.patch(`/shared-exams/${examId}/visibility`, { visibility: newVisibility });
      await queryClient.invalidateQueries({ queryKey: ["my-exams"] });
    } catch (err) {
      console.error("Error changing visibility", err);
    }
  };

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
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section (Banner + Avatar) */}
        <View style={styles.heroSection}>
          <View style={styles.banner}>
            <Image 
              source={profile?.bannerUrl ? { uri: profile.bannerUrl } : require("../../assets/images/galaxy-banner.png")} 
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} 
              resizeMode="cover"
            />
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
            <Text style={styles.displayName}>{user?.displayName || "Usuario"}</Text>
            <Text style={styles.usernameText}>@{profile?.username || "usuario"}</Text>
            {profile?.targetUniversity && (
              <Text style={styles.universityText}>🎓 {profile.targetUniversity}</Text>
            )}
            <Text style={styles.emailText}>{user?.email}</Text>

            {/* Social Row */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialStat} onPress={() => setActiveTab("FRIENDS")}>
                <Text style={styles.socialStatValue}>{myFriendsQuery.data?.data?.length || 0}</Text>
                <Text style={styles.socialStatLabel}>Amigos</Text>
              </TouchableOpacity>
              <View style={styles.socialDivider} />
              <TouchableOpacity style={styles.socialStat} onPress={() => setActiveTab("POSTS")}>
                <Text style={styles.socialStatValue}>{myPostsQuery.data?.data?.length || 0}</Text>
                <Text style={styles.socialStatLabel}>Publicaciones</Text>
              </TouchableOpacity>
              <View style={styles.socialDivider} />
              <TouchableOpacity style={styles.socialStat} onPress={() => setActiveTab("EXAMS")}>
                <Text style={styles.socialStatValue}>{myExamsQuery.data?.data?.length || 0}</Text>
                <Text style={styles.socialStatLabel}>Exámenes</Text>
              </TouchableOpacity>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("/edit-profile")}>
              <Text style={styles.editProfileText}>Editar Perfil</Text>
            </TouchableOpacity>
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
          <View style={[styles.coreStatCard, styles.coreStatCardFlame]}>
            <View style={styles.coreStatIconBg}>
              <FlameIcon size={38} gradient={true} />
            </View>
            <Text style={[styles.coreStatValue, { color: "#9f1239" }]}>{profile?.currentStreakDays || 0}</Text>
            <Text style={[styles.coreStatLabel, { color: "#be123c" }]}>Racha</Text>
          </View>
          
          <View style={[styles.coreStatCard, styles.coreStatCardZap]}>
            <View style={styles.coreStatIconBg}>
              <LightningIcon size={38} gradient={true} />
            </View>
            <Text style={[styles.coreStatValue, { color: "#854d0e" }]}>{profile?.experience || 0}</Text>
            <Text style={[styles.coreStatLabel, { color: "#a16207" }]}>XP Total</Text>
          </View>

          <View style={[styles.coreStatCard, styles.coreStatCardTrophy]}>
            <View style={styles.coreStatIconBg}>
              <TrophyIcon size={38} gradient={true} />
            </View>
            <Text style={[styles.coreStatValue, { color: "#1e3a8a" }]}>{profile?.level || 1}</Text>
            <Text style={[styles.coreStatLabel, { color: "#1d4ed8" }]}>Nivel</Text>
          </View>
        </View>

        {/* Tab Menu */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabMenuContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === "ACHIEVEMENTS" && styles.tabButtonActive]}
            onPress={() => setActiveTab("ACHIEVEMENTS")}
          >
            <Trophy size={16} color={activeTab === "ACHIEVEMENTS" ? theme.colors.brandBlue : "#64748b"} />
            <Text style={[styles.tabButtonText, activeTab === "ACHIEVEMENTS" && styles.tabButtonTextActive]}>Logros</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === "EXAMS" && styles.tabButtonActive]}
            onPress={() => setActiveTab("EXAMS")}
          >
            <CalendarDays size={16} color={activeTab === "EXAMS" ? theme.colors.brandBlue : "#64748b"} />
            <Text style={[styles.tabButtonText, activeTab === "EXAMS" && styles.tabButtonTextActive]}>Exámenes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === "FRIENDS" && styles.tabButtonActive]}
            onPress={() => setActiveTab("FRIENDS")}
          >
            <Users size={16} color={activeTab === "FRIENDS" ? theme.colors.brandBlue : "#64748b"} />
            <Text style={[styles.tabButtonText, activeTab === "FRIENDS" && styles.tabButtonTextActive]}>Amigos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === "POSTS" && styles.tabButtonActive]}
            onPress={() => setActiveTab("POSTS")}
          >
            <MessageSquare size={16} color={activeTab === "POSTS" ? theme.colors.brandBlue : "#64748b"} />
            <Text style={[styles.tabButtonText, activeTab === "POSTS" && styles.tabButtonTextActive]}>Publicaciones</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tab Content */}
        {activeTab === "ACHIEVEMENTS" && (
          <View>
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
                <BookIcon size={20} gradient={true} />
                <Text style={styles.detailedStatTitle}>Exámenes</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{progress?.totalExamsCompleted || 0}</Text>
              <Text style={styles.detailedStatDesc}>completados</Text>
            </View>

            {/* Stat 2 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <TargetIcon size={20} gradient={true} />
                <Text style={styles.detailedStatTitle}>Precisión</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{hitRate}%</Text>
              <Text style={styles.detailedStatDesc}>{progress?.totalCorrectAnswers || 0} aciertos</Text>
            </View>

            {/* Stat 3 */}
            <View style={styles.detailedStatCard}>
              <View style={styles.detailedStatHeader}>
                <ClockIcon size={20} gradient={true} />
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
                <AwardIcon size={20} gradient={true} />
            <Text style={styles.detailedStatTitle}>Flashcards</Text>
              </View>
              <Text style={styles.detailedStatNumber}>{progress?.totalFlashcardsReviewed || 0}</Text>
              <Text style={styles.detailedStatDesc}>repasadas</Text>
            </View>
            </View>
          </View>
          </View>
        )}
        {activeTab === "EXAMS" && (
          <View style={{ paddingHorizontal: 16 }}>
            {myExamsQuery.isLoading ? (
              <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 32, fontWeight: "700" }}>Cargando exámenes...</Text>
            ) : myExamsQuery.isError ? (
              <Text style={{ textAlign: "center", color: "#ef4444", marginVertical: 32, fontWeight: "700" }}>Error al cargar los exámenes.</Text>
            ) : !myExamsQuery.data?.data || myExamsQuery.data.data.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBg}>
                  <Sparkles size={32} color={theme.colors.brandBlue} />
                </View>
                <Text style={styles.emptyStateTitle}>No hay exámenes</Text>
                <Text style={styles.emptyStateDesc}>Aún no has creado ni compartido ningún examen.</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {myExamsQuery.data.data.map((exam: any) => (
                  <View key={exam.id} style={styles.itemCard}>
                    <View style={styles.itemCardHeader}>
                      <View style={[styles.itemBadge, exam.visibility === "PUBLIC" ? styles.badgePublic : styles.badgePrivate]}>
                        {exam.visibility === "PUBLIC" ? <Globe size={10} color="#059669" /> : <Lock size={10} color="#475569" />}
                        <Text style={[styles.itemBadgeText, exam.visibility === "PUBLIC" ? { color: "#059669" } : { color: "#475569" }]}>
                          {exam.visibility === "PUBLIC" ? "Público" : "Privado"}
                        </Text>
                      </View>
                      <Text style={styles.itemMetaText}>{exam.questionCount} {exam.questionCount === 1 ? "pregunta" : "preguntas"}</Text>
                    </View>
                    <Text style={styles.itemTitle} numberOfLines={1}>{exam.title}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{exam.description || "Sin descripción."}</Text>
                    
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemDateText}>Creado el {new Date(exam.createdAt).toLocaleDateString()}</Text>
                      <TouchableOpacity 
                        style={[styles.itemActionBtn, exam.visibility === "PUBLIC" ? styles.btnPrivate : styles.btnPublic]}
                        onPress={() => handleToggleVisibility(exam.id, exam.visibility)}
                      >
                        <Text style={[styles.itemActionBtnText, exam.visibility === "PUBLIC" ? { color: "#d97706" } : { color: theme.colors.brandBlue }]}>
                          {exam.visibility === "PUBLIC" ? "Hacer Privado" : "Hacer Público"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "FRIENDS" && (
          <View style={{ paddingHorizontal: 16 }}>
            {myFriendsQuery.isLoading ? (
              <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 32, fontWeight: "700" }}>Cargando amigos...</Text>
            ) : myFriendsQuery.isError ? (
              <Text style={{ textAlign: "center", color: "#ef4444", marginVertical: 32, fontWeight: "700" }}>Error al cargar amigos.</Text>
            ) : !myFriendsQuery.data?.data || myFriendsQuery.data.data.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBg}>
                  <Users size={32} color={theme.colors.brandBlue} />
                </View>
                <Text style={styles.emptyStateTitle}>Sin amigos aún</Text>
                <Text style={styles.emptyStateDesc}>Comienza buscando usuarios para conectar con otros estudiantes.</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {myFriendsQuery.data.data.map((friend: any) => (
                  <View key={friend.id} style={styles.friendCard}>
                    {friend.photoUrl ? (
                      <Image source={{ uri: friend.photoUrl }} style={styles.friendAvatar} />
                    ) : (
                      <View style={styles.friendAvatarPlaceholder}>
                        <Text style={styles.friendAvatarText}>
                          {(friend.displayName || friend.username || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={styles.friendName} numberOfLines={1}>{friend.displayName || friend.username || "Usuario"}</Text>
                        <View style={styles.friendLevelBadge}>
                          <Text style={styles.friendLevelText}>Lv. {friend.level}</Text>
                        </View>
                      </View>
                      {friend.username && (
                        <Text style={styles.friendUsername}>@{friend.username}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "POSTS" && (
          <View style={{ paddingHorizontal: 16 }}>
            {myPostsQuery.isLoading ? (
              <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 32, fontWeight: "700" }}>Cargando publicaciones...</Text>
            ) : myPostsQuery.isError ? (
              <Text style={{ textAlign: "center", color: "#ef4444", marginVertical: 32, fontWeight: "700" }}>Error al cargar publicaciones.</Text>
            ) : !myPostsQuery.data?.data || myPostsQuery.data.data.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBg}>
                  <MessageSquare size={32} color={theme.colors.brandBlue} />
                </View>
                <Text style={styles.emptyStateTitle}>Sin publicaciones</Text>
                <Text style={styles.emptyStateDesc}>Tus aportaciones al foro comunitario aparecerán aquí.</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {myPostsQuery.data.data.map((post: any) => (
                  <View key={post.id} style={styles.itemCard}>
                    <View style={styles.itemCardHeader}>
                      <View style={styles.postTypeBadge}>
                        <Text style={styles.postTypeText}>{post.type}</Text>
                      </View>
                      <Text style={styles.itemMetaText}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {post.title && (
                      <Text style={[styles.itemTitle, { marginTop: 8 }]} numberOfLines={2}>{post.title}</Text>
                    )}
                    <Text style={styles.itemDesc} numberOfLines={3}>{post.content}</Text>
                    
                    <View style={styles.postFooter}>
                      <View style={styles.postStatItem}>
                        <MessageSquare size={12} color="#94a3b8" />
                        <Text style={styles.postStatText}>{post.commentsCount} comentarios</Text>
                      </View>
                      <View style={styles.postStatItem}>
                        <Heart size={12} color="#f87171" />
                        <Text style={styles.postStatText}>{post.reactionsCount} reacciones</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Settings & Extras */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
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
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
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

  // Social Row
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  socialStat: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  socialStatValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  socialStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
  },
  performanceLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  tabMenuContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: `${theme.colors.brandBlue}15`,
    borderColor: `${theme.colors.brandBlue}30`,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabButtonTextActive: {
    color: theme.colors.brandBlue,
    fontWeight: "800",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginTop: 8,
  },
  emptyStateIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.brandBlue}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  // Cards for Social Tabs
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgePublic: {
    backgroundColor: "#d1fae5",
  },
  badgePrivate: {
    backgroundColor: "#f1f5f9",
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemMetaText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 8,
  },
  itemDesc: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  itemDateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
  },
  itemActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnPublic: {
    borderColor: `${theme.colors.brandBlue}30`,
    backgroundColor: `${theme.colors.brandBlue}10`,
  },
  btnPrivate: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  itemActionBtnText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  
  // Post styles
  postTypeBadge: {
    backgroundColor: `${theme.colors.brandBlue}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postTypeText: {
    fontSize: 9,
    fontWeight: "900",
    color: theme.colors.brandBlue,
    textTransform: "uppercase",
  },
  postFooter: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  postStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
  },

  // Friend Card
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  friendAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
    flex: 1,
  },
  friendUsername: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 2,
  },
  friendLevelBadge: {
    backgroundColor: `${theme.colors.brandCyan}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  friendLevelText: {
    fontSize: 9,
    fontWeight: "900",
    color: theme.colors.brandBlue,
  },

  socialDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e2e8f0",
  },

  // Edit Profile Button
  editProfileButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
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
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  coreStatCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
  },
  coreStatCardFlame: {
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
    shadowColor: "#f43f5e",
  },
  coreStatCardZap: {
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
    shadowColor: "#fbbf24",
  },
  coreStatCardTrophy: {
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
    shadowColor: "#3b82f6",
  },
  coreStatIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  coreStatValue: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  coreStatLabel: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
