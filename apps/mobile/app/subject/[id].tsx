import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Play, FileText, CheckCircle, Clock, ChevronRight, BarChart } from "lucide-react-native";
import { useTemarioViewModel } from "../../src/viewmodels/useTemarioViewModel";
import { useSubjectExams } from "../../src/viewmodels/useExamSessionViewModel";
import { theme } from "../../src/theme";
import { SubjectIcons } from "../../src/utils/SubjectIcons";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { subjects } = useTemarioViewModel();
  const subject = subjects.find(s => s.id === id);
  
  const { exams, isLoading: isLoadingExams, startExam } = useSubjectExams(id);

  const [examFilter, setExamFilter] = useState<"todos" | "completados" | "pendientes">("todos");

  const iconSource = subject?.slug ? SubjectIcons[subject.slug] : SubjectIcons["biologia"];

  const filteredExams = useMemo(() => {
    if (examFilter === "completados") return exams.filter(e => e.status === "COMPLETED");
    if (examFilter === "pendientes") return exams.filter(e => e.status !== "COMPLETED");
    return exams;
  }, [exams, examFilter]);

  const handleStartPractice = async () => {
    try {
      const examSession = await startExam(); 
      if (examSession) {
        router.push(`/exam/${examSession.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderExam = ({ item }: { item: any }) => {
    const isCompleted = item.status === "COMPLETED";
    const score = item.totalScore || 0;
    const date = item.lastActivityAt ? new Date(item.lastActivityAt).toLocaleDateString() : "Reciente";

    return (
      <TouchableOpacity 
        style={styles.examCard} 
        activeOpacity={0.8}
        onPress={() => router.push(`/exam/${item.id}`)}
      >
        <View style={styles.examHeader}>
          <View style={[styles.examStatusBadge, isCompleted ? styles.badgeSuccess : styles.badgePending]}>
            {isCompleted ? <CheckCircle size={12} color="#10b981" /> : <Clock size={12} color="#f59e0b" />}
            <Text style={[styles.examStatusText, isCompleted ? { color: "#10b981" } : { color: "#f59e0b" }]}>
              {isCompleted ? "Completado" : "Pendiente"}
            </Text>
          </View>
          <Text style={styles.examDate}>{date}</Text>
        </View>
        <Text style={styles.examTitle}>{item.title || "Simulacro de Práctica"}</Text>
        <View style={styles.examFooter}>
          <View style={styles.examStats}>
            <View style={styles.examStatItem}>
              <FileText size={16} color="#64748b" />
              <Text style={styles.examStatText}>{item.questions?.length || 0} Preguntas</Text>
            </View>
            {isCompleted && (
              <View style={[styles.examStatItem, { marginLeft: 16 }]}>
                <BarChart size={16} color="#0879F2" />
                <Text style={[styles.examStatText, { color: "#0879F2", fontWeight: "600" }]}>{score} pts</Text>
              </View>
            )}
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <Image source={iconSource} style={styles.heroIconLarge} contentFit="contain" />
        <Text style={styles.heroTitle}>{subject?.name || "Materia"}</Text>
        <Text style={styles.heroSubtitle}>Domina todos los conceptos para arrasar en selectividad.</Text>
      </View>

      {/* Main Content Wrapped in a Premium Box */}
      <View style={styles.mainBoxWrapper}>
        <View style={styles.boxHeader}>
          <Text style={styles.boxTitle}>Tus Exámenes</Text>
        </View>

        <View style={styles.filterRow}>
          {(["todos", "pendientes", "completados"] as const).map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterChip, examFilter === filter && styles.filterChipActive]}
              onPress={() => setExamFilter(filter)}
            >
              <Text style={[styles.filterChipText, examFilter === filter && styles.filterChipTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoadingExams ? (
          <ActivityIndicator size="large" color={theme.colors.brandBlue} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredExams}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderExam}
            ListEmptyComponent={<Text style={styles.emptyText}>No has realizado exámenes de esta materia.</Text>}
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton} onPress={handleStartPractice} activeOpacity={0.9}>
          <Play size={20} color="#ffffff" fill="#ffffff" />
          <Text style={styles.fabText}>Simulacro Rápido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: "center",
  },
  heroIconLarge: { 
    width: 140, 
    height: 140, 
    marginBottom: 20 
  },
  heroTitle: { fontSize: 32, fontWeight: "900", color: "#0f172a", marginBottom: 8, textAlign: "center" },
  heroSubtitle: { fontSize: 16, color: "#64748b", textAlign: "center", paddingHorizontal: 20 },
  
  mainBoxWrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  boxHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },

  loader: { marginTop: 40 },
  emptyText: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  filterRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: { backgroundColor: "#0879F2", borderColor: "#0879F2" },
  filterChipText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  filterChipTextActive: { color: "#ffffff" },
  
  examCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  examHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  examStatusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeSuccess: { backgroundColor: "#d1fae5" },
  badgePending: { backgroundColor: "#fef3c7" },
  examStatusText: { fontSize: 12, fontWeight: "700" },
  examDate: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  examTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 16 },
  examFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  examStats: { flexDirection: "row", alignItems: "center" },
  examStatItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  examStatText: { fontSize: 14, fontWeight: "500", color: "#64748b" },

  fabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: "transparent", 
  },
  fabButton: {
    flexDirection: "row",
    backgroundColor: "#0879F2",
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0879F2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: { fontSize: 16, fontWeight: "800", color: "#ffffff", marginLeft: 8 },
});
