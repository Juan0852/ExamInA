import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTemarioViewModel, Subject } from "../../src/viewmodels/useTemarioViewModel";
import { theme } from "../../src/theme";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const columnCount = 3;
const gap = 12;
const paddingHorizontal = 16;
const cardWidth = (width - paddingHorizontal * 2 - gap * (columnCount - 1)) / columnCount;

import { SubjectIcons } from "../../src/utils/SubjectIcons";
function SubjectCard({ subject }: { subject: Subject }) {
  const router = useRouter();
  const iconSource = SubjectIcons[subject.slug] || SubjectIcons["biologia"];

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]} 
      activeOpacity={0.7}
      onPress={() => router.push(`/subject/${subject.id}`)}
    >
      <View style={styles.iconContainer}>
        <Image 
          source={iconSource} 
          style={styles.icon} 
          contentFit="contain" 
          transition={200}
        />
      </View>
      <Text style={styles.subjectName} numberOfLines={2}>
        {subject.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function TemarioScreen() {
  const { subjects, isLoadingSubjects, refetchSubjects } = useTemarioViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Temario</Text>
        <Text style={styles.subtitle}>Selecciona una materia para explorar sus temas y practicar.</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoadingSubjects} onRefresh={refetchSubjects} tintColor={theme.colors.brandBlue} />
        }
        renderItem={({ item }) => <SubjectCard subject={item} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  rowWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  subjectName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
    lineHeight: 16,
  },
});
