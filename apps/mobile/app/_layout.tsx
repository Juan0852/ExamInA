import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { View, StyleSheet, LogBox, Platform } from "react-native";
import { theme } from "../src/theme";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { hasCompletedOnboarding } from "../src/utils/onboarding";

LogBox.ignoreLogs(["THREE.WebGLRenderer: WebGL 1 support was deprecated"]);

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initializeSession, isLoading, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeSession();

    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isLoginScreen = segments[0] === "login";
    const isOnboardingScreen = segments[0] === "onboarding";
    const user = useAuthStore.getState().user;
    const onboardingCompleted = hasCompletedOnboarding(user);

    if (!isAuthenticated && !isLoginScreen) {
      // Redirigir al login si no está autenticado y no está en la pantalla de login
      router.replace("/login");
    } else if (isAuthenticated && !onboardingCompleted && !isOnboardingScreen) {
      router.replace("/onboarding");
    } else if (isAuthenticated && onboardingCompleted && isLoginScreen) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isLoading, isAuthenticated, segments]);

  if (isLoading) {
    // Retornamos un ActivityIndicator nativo muy ligero en lugar del modelo 3D de 83MB que congela el emulador
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
