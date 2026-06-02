import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "../src/stores/auth.store";
import {
  getGoogleClientIds,
  getReadableAuthError,
  loginWithEmailPassword,
  loginWithGoogleToken,
  registerWithEmailPassword
} from "../src/services/mobile-auth.service";
import { theme } from "../src/theme";
import { Ionicons } from "@expo/vector-icons";
import { loginSchema, registerSchema } from "../src/utils/schemas";

WebBrowser.maybeCompleteAuthSession();

function getPasswordStrength(pass: string) {
  if (!pass) return { count: 0, label: "", color: "#e2e8f0" };

  let count = 0;
  if (pass.length >= 8) count++;
  if (/[A-Z]/.test(pass)) count++;
  if (/[a-z]/.test(pass)) count++;
  if (/[0-9]/.test(pass)) count++;
  if (/[^A-Za-z0-9]/.test(pass)) count++;

  let label = "Muy débil";
  let color = "#ef4444"; // red-500

  if (count === 2) {
    label = "Débil";
    color = "#eab308"; // yellow-500
  } else if (count === 3 || count === 4) {
    label = "Media";
    color = "#f97316"; // orange-500
  } else if (count === 5) {
    label = "Fuerte";
    color = "#22c55e"; // green-500
  }

  return { count, label, color };
}

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const googleClientIds = useMemo(() => getGoogleClientIds(), []);
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientIds.webClientId || googleClientIds.iosClientId || googleClientIds.androidClientId || "missing-google-client-id.apps.googleusercontent.com",
    webClientId: googleClientIds.webClientId,
    iosClientId: googleClientIds.iosClientId,
    androidClientId: googleClientIds.androidClientId,
    selectAccount: true
  });

  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (view === "login") {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }
    } else {
      const result = registerSchema.safeParse({ email, password, confirmPassword });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = view === "login"
        ? await loginWithEmailPassword(email, password)
        : await registerWithEmailPassword(email, password);

      if (!response.data.auth?.idToken) {
        throw new Error("El servidor no devolvió un token de sesión válido.");
      }

      await setSession(response.data.auth.idToken, response.data.user, response.data.auth.refreshToken);
      
      if (!response.data.user.profile) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)/dashboard");
      }
    } catch (err: any) {
      setError(getReadableAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!googleClientIds.hasAnyClientId) {
      setError("Faltan los client IDs de Google en la configuración mobile.");
      return;
    }

    if (!googleRequest) {
      setError("Google todavía está preparando el inicio de sesión. Inténtalo otra vez.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await promptGoogleAsync();
    if (result.type !== "success") {
      setIsLoading(false);
      setError("El inicio con Google fue cancelado.");
    }
  };

  useEffect(() => {
    const googleIdToken = googleResponse?.type === "success" ? googleResponse.params.id_token : null;

    if (!googleIdToken) {
      return;
    }

    const token = googleIdToken;
    let isMounted = true;

    async function finishGoogleAuth() {
      try {
        const response = await loginWithGoogleToken(token);

        if (!response.data.auth?.idToken) {
          throw new Error("El servidor no devolvió un token de sesión válido.");
        }

        await setSession(response.data.auth.idToken, response.data.user, response.data.auth.refreshToken);

        if (!response.data.user.profile) {
          router.replace("/onboarding");
        } else {
          router.replace("/(tabs)/dashboard");
        }
      } catch (err) {
        if (isMounted) {
          setError(getReadableAuthError(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void finishGoogleAuth();

    return () => {
      isMounted = false;
    };
  }, [googleResponse, router, setSession]);

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
            {view === "register" && password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabelText}>Fuerza de la contraseña:</Text>
                  <Text style={[styles.strengthValueText, { color: getPasswordStrength(password).color }]}>
                    {getPasswordStrength(password).label}
                  </Text>
                </View>
                <View style={styles.strengthTrack}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${(getPasswordStrength(password).count / 5) * 100}%`,
                        backgroundColor: getPasswordStrength(password).color 
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>

          {view === "register" && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Repetir contraseña</Text>
              <View style={[styles.inputContainer, confirmPassword.length > 0 && password !== confirmPassword ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.helperTextError}>las contraseñas no coinciden...</Text>
              )}
            </View>
          )}

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
            <TouchableOpacity onPress={() => { 
              setView(view === "login" ? "register" : "login"); 
              setError(null); 
              setConfirmPassword("");
            }}>
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
    backgroundColor: "#f1f5f9",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  helperTextError: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  strengthLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  strengthValueText: {
    fontSize: 10,
    fontWeight: "700",
  },
  strengthTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 3,
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
