import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BookOpen, Trophy, ChevronRight, Zap } from "lucide-react-native";
import { theme } from "../../src/theme";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function ExamenesSelectorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Zap size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.headerBadgeText}>MODO PRÁCTICA</Text>
          </View>
          <Text style={styles.title}>¿Cómo quieres darle hoy?</Text>
          <Text style={styles.subtitle}>Elige tu estilo y empieza a sumar puntos.</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Card: Por Temas */}
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/por-temas")}
          >
            <LinearGradient
              colors={["#f97316", "#ea580c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.glowOverlay} />
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <BookOpen size={24} color="#fff" />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: "#fff" }]}>Por Temas</Text>
                <Text style={[styles.cardDescription, { color: "rgba(255,255,255,0.85)" }]}>
                  Ve al grano. Practica temas específicos y domina el catálogo a tu ritmo.
                </Text>
              </View>
              <View style={[styles.cardFooter, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
                <Text style={[styles.actionText, { color: "#fff" }]}>EXPLORAR TEMARIO</Text>
                <ChevronRight size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card: Oficiales Completos */}
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/oficiales-completos")}
          >
            <LinearGradient
              colors={["#4f46e5", "#3730a3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.glowOverlay} />
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Trophy size={24} color="#fff" />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: "#fff" }]}>Oficiales Completos</Text>
                <Text style={[styles.cardDescription, { color: "rgba(255,255,255,0.85)" }]}>
                  El desafío real. Enfréntate a exámenes completos de años anteriores.
                </Text>
              </View>
              <View style={[styles.cardFooter, { backgroundColor: "rgba(0,0,0,0.15)" }]}>
                <Text style={[styles.actionText, { color: "#fff" }]}>VER OFICIALES</Text>
                <ChevronRight size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#d97706",
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
    maxWidth: "90%",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
    position: "relative",
  },
  glowOverlay: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 2 }],
  },
  cardHeader: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
