import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { View, StyleSheet, LogBox, Platform } from "react-native";
import { theme } from "../src/theme";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";

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

    if (!isAuthenticated && !isLoginScreen) {
      // Redirigir al login si no está autenticado y no está en la pantalla de login
      router.replace("/login");
    } else if (isAuthenticated && isLoginScreen) {
      // Redirigir al dashboard o al onboarding si está autenticado pero intenta ir al login
      const user = useAuthStore.getState().user;
      if (user && !user.profile) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)/dashboard");
      }
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