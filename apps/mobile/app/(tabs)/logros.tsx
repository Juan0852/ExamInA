import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../src/theme";
import { Trophy } from "lucide-react-native";

export default function LogrosScreen() {
  return (
    <View style={styles.container}>
      <Trophy size={64} color={theme.colors.brandBlue} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Tus Medallas</Text>
      <Text style={styles.subtitle}>Próximamente... aquí verás todos tus logros y medallas ganadas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f8fafc",
    padding: 24
  },
  title: { 
    fontSize: 24, 
    fontWeight: "900", 
    color: "#0f172a" 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#64748b", 
    marginTop: 8,
    textAlign: "center"
  },
});
