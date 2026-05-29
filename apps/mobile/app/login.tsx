import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { apiService } from "../src/services/api.service";
import { theme } from "../src/theme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Por favor, introduce tu email y contraseña.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = view === "login" ? "/auth/login" : "/auth/register";
      const response = await apiService.post<{
        data: {
          user: any;
          auth?: {
            idToken: string;
          };
        };
      }>(endpoint, { email, password });

      if (!response.data.auth?.idToken) {
        throw new Error("El servidor no devolvió un token de sesión válido.");
      }

      await setSession(response.data.auth.idToken, response.data.user);
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      setError(err.message || (view === "login" ? "Error al iniciar sesión." : "Error al registrarse."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google Sign-In logic here
    setError("Inicio con Google no implementado aún.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Image
              source={require("../assets/examina-logo-transparent-cropped.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {view === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </Text>
            <Text style={styles.subtitle}>
              🎓 Crea tus flashcards · 🏆 Gana medallas · 📚 Comparte exámenes
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={theme.colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleAuth}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>
              {view === "login" ? "Continuar con Google" : "Registrarse con Google"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CON EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {view === "login" ? "Entrar" : "Crear cuenta"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {view === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            </Text>
            <TouchableOpacity onPress={() => { setView(view === "login" ? "register" : "login"); setError(null); }}>
              <Text style={styles.toggleTextBold}>
                {view === "login" ? "Créala aquí" : "Inicia sesión"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.space4,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.space6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.space6,
  },
  logo: {
    width: 280,
    height: 100,
    marginBottom: theme.spacing.space4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.brandNavy,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: theme.spacing.space2,
    fontWeight: "600",
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.space3,
    marginBottom: theme.spacing.space4,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 48,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.space5,
  },
  googleButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.space5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: "#94a3b8",
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: "700",
  },
  inputWrapper: {
    marginBottom: theme.spacing.space4,
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: theme.spacing.space2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    height: 48,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 14,
    height: "100%",
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
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.space6,
  },
  toggleText: {
    color: "#64748b",
    fontSize: 12,
  },
  toggleTextBold: {
    color: theme.colors.brandBlue,
    fontSize: 12,
    fontWeight: "700",
  },
});
