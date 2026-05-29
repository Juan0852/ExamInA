import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { apiService } from "../src/services/api.service";
import { theme } from "../src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, introduce tu email y contraseña.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post<{
        data: {
          user: any;
          auth?: {
            idToken: string;
          };
        };
      }>("/auth/login", {
        email,
        password,
      });

      if (!response.data.auth?.idToken) {
        throw new Error("El servidor no devolvió un token de sesión válido.");
      }

      await setSession(response.data.auth.idToken, response.data.user);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock session for quick developer preview
      const mockUser = {
        id: "mock-student-id",
        email: "demo@examina.com",
        displayName: "Estudiante Demo",
        role: "STUDENT" as const,
        profile: {
          id: "mock-profile-id",
          username: "estudiante_demo",
          bio: "Preparando Selectividad de Matemáticas y Física",
          targetUniversity: "Universidad Complutense de Madrid",
          level: 5,
          experience: 750,
          currentStreakDays: 3,
          longestStreakDays: 12,
        },
      };
      await setSession("mock-jwt-token-value", mockUser);
      router.replace("/dashboard");
    } catch (err: any) {
      setError("Error al iniciar sesión demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ExamInA</Text>
          <Text style={styles.subtitle}>Preparación PAU / Selectividad Inteligente</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={theme.colors.textSoft}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce tu contraseña"
            placeholderTextColor={theme.colors.textSoft}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o bien</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Acceso Demo Rápido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.space6,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.space10,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: theme.spacing.space3,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.brandCyan,
    marginTop: theme.spacing.space1,
    fontWeight: "600",
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.space5,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    marginBottom: theme.spacing.space3,
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: theme.spacing.space2,
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    height: 48,
    paddingHorizontal: theme.spacing.space4,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: theme.spacing.space4,
  },
  primaryButton: {
    backgroundColor: theme.colors.brandBlue,
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.space2,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.space4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSoft,
    paddingHorizontal: theme.spacing.space3,
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    height: 48,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.brandCyan,
    fontSize: 16,
    fontWeight: "600",
  },
});
