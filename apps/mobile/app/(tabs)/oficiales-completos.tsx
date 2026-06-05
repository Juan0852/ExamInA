import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTemarioViewModel, Subject } from "../../src/viewmodels/useTemarioViewModel";
import { theme } from "../../src/theme";
import { Image } from "expo-image";
import { Trophy } from "lucide-react-native";

const { width } = Dimensions.get("window");
const columnCount = 2; 
const gap = 16;
const paddingHorizontal = 16;
const cardWidth = (width - paddingHorizontal * 2 - gap * (columnCount - 1)) / columnCount;

import { SubjectIcons } from "../../src/utils/SubjectIcons";

function SubjectCard({ subject }: { subject: Subject }) {
  const router = useRouter();
  const slug = subject.slug || "";
  const iconKey = Object.keys(SubjectIcons).find(k => slug.includes(k)) || "biologia";
  const iconSource = SubjectIcons[iconKey] || SubjectIcons["biologia"];

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]} 
      activeOpacity={0.75}
      onPress={() => router.push(`/oficiales/${subject.id}`)}
    >
      <View style={styles.iconContainer}>
        <Image 
          source={iconSource} 
          style={styles.icon} 
          contentFit="contain" 
          transition={300}
        />
      </View>
      <Text 
        style={styles.subjectName} 
        numberOfLines={3} 
        adjustsFontSizeToFit 
        minimumFontScale={0.7}
      >
        {subject.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function OficialesCompletosScreen() {
  const { subjects, isLoadingSubjects, refetchSubjects } = useTemarioViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Asignaturas</Text>
          
          <View style={styles.modeContainer}>
            <Trophy size={16} color={theme.colors.brandBlue} />
            <Text style={styles.modeText}>EXÁMENES OFICIALES</Text>
          </View>

          <Text style={styles.subtitle}>Selecciona la materia para hacer un simulacro oficial completo.</Text>
        </View>
      </View>

      <FlatList
        key="2-cols"
        data={subjects}
        keyExtractor={(item) => item.id}
        numColumns={columnCount}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoadingSubjects} onRefresh={refetchSubjects} tintColor={theme.colors.brandBlue} />
        }
        renderItem={({ item }) => <SubjectCard subject={item} />}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8, // Safe area reducida
    paddingBottom: 16,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  modeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff", // Fondo azul clarito
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.brandBlue,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  rowWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  iconContainer: {
    width: 75,
    height: 75,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  subjectName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 18,
    width: "100%",
  },
});
