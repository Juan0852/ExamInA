import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Rss, Users, FileText } from "lucide-react-native";
import { theme } from "../../src/theme";

export default function FeedScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconBubble}>
          <Rss size={32} color={theme.colors.brandBlue} />
        </View>
        <Text style={styles.title}>Feed</Text>
        <Text style={styles.subtitle}>
          Muy pronto podras ver publicaciones, examenes compartidos y actividad de la comunidad.
        </Text>
      </View>

      <View style={styles.previewRow}>
        <View style={styles.previewCard}>
          <Users size={22} color={theme.colors.brandBlue} />
          <Text style={styles.previewTitle}>Comunidad</Text>
          <Text style={styles.previewText}>Conecta con estudiantes y sigue su progreso.</Text>
        </View>
        <View style={styles.previewCard}>
          <FileText size={22} color={theme.colors.brandBlue} />
          <Text style={styles.previewTitle}>Examenes</Text>
          <Text style={styles.previewText}>Descubre examenes compartidos por otros usuarios.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.space5,
    paddingBottom: 120,
  },
  hero: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#D8ECFF",
    backgroundColor: "#F2FAFF",
    padding: theme.spacing.space6,
    marginBottom: theme.spacing.space5,
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.space4,
    ...theme.shadows.sm,
  },
  title: {
    color: theme.colors.brandNavy,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: theme.spacing.space2,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  previewRow: {
    flexDirection: "row",
    gap: theme.spacing.space3,
  },
  previewCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#E1EAF4",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.space4,
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: theme.spacing.space3,
    marginBottom: theme.spacing.space1,
  },
  previewText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
