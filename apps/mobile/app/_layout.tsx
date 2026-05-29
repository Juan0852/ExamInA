import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { View, StyleSheet } from "react-native";
import { theme } from "../src/theme";
import { SplashScreen3D } from "../src/components/SplashScreen3D";

export default function RootLayout() {
  const { initializeSession, isLoading } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, []);

  if (isLoading) {
    return <SplashScreen3D />;
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});