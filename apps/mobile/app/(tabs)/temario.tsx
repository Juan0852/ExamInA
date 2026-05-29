import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TemarioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temario</Text>
      <Text style={styles.subtitle}>Próximamente...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#64748b", marginTop: 8 },
});
