import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";
import { apiService } from "../src/services/api.service";
import { theme } from "../src/theme";
import * as ImagePicker from "expo-image-picker";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  UserRound, 
  Image as ImageIcon,
  BookOpen,
  Trophy
} from "lucide-react-native";

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface SubjectsApiResponse {
  data: Subject[];
}

interface UsernameAvailabilityResponse {
  data: {
    available: boolean;
  };
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, token, setSession } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<string>("");
  const [referralSource, setReferralSource] = useState<string>("");
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.photoUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedUsername = username.trim().toLowerCase();

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  // Query Subjects
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery<SubjectsApiResponse, Error>({
    queryKey: ["subjects-onboarding"],
    queryFn: () => apiService.get<SubjectsApiResponse>("/subjects"),
    enabled: !!token,
  });

  const subjects = subjectsData?.data && subjectsData.data.length > 0 
    ? subjectsData.data 
    : [
        { id: "sub-1", name: "Matemáticas II", slug: "matematicas-ii" },
        { id: "sub-2", name: "Física", slug: "fisica" },
        { id: "sub-3", name: "Química", slug: "quimica" },
        { id: "sub-4", name: "Biología", slug: "biologia" },
        { id: "sub-5", name: "Lengua Castellana", slug: "lengua" },
      ];

  // Check Username Availability
  const usernameAvailabilityQuery = useQuery<UsernameAvailabilityResponse, Error>({
    queryKey: ["username-availability", normalizedUsername],
    queryFn: () =>
      apiService.get<UsernameAvailabilityResponse>(
        `/auth/profile/username-availability?username=${encodeURIComponent(normalizedUsername)}`
      ),
    enabled: step === 3 && normalizedUsername.length >= 3 && !!token,
  });

  const isUsernameFormatValid = /^[a-z0-9_]+$/.test(normalizedUsername);
  const isUsernameAvailable = usernameAvailabilityQuery.data?.data.available !== false;
  const usernameError =
    normalizedUsername.length > 0 && normalizedUsername.length < 3
      ? "El nombre debe tener al menos 3 caracteres."
      : normalizedUsername.length >= 3 && !isUsernameFormatValid
      ? "Usa solo letras minúsculas, números y guiones bajos."
      : normalizedUsername.length >= 3 && usernameAvailabilityQuery.data?.data.available === false
      ? "Ese nombre ya está en uso."
      : null;

  const handleToggleSubject = (id: string) => {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      
      // Upload
      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append("file", {
          uri,
          name: filename,
          type
        } as any);

        const uploadRes = await apiService.post<any>("/files/upload/avatar", formData);
        if (uploadRes?.data?.url) {
          setAvatarUrl(uploadRes.data.url);
        }
      } catch (err) {
        console.error("Upload error", err);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleFinishOnboarding = async () => {
    if (isUploadingAvatar) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiService.post<any>("/auth/onboarding/complete", {
        displayName: normalizedUsername,
        username: normalizedUsername,
        bio: bio.trim(),
        targetUniversity: targetUniversity.trim(),
        photoUrl: avatarUrl.trim(),
        preferredSubjects: selectedSubjects,
        weeklyStudyHours: weeklyHours || "No especificado",
        referralSource: referralSource || "No especificado",
      });

      if (response?.data?.user) {
        // Mantenemos el token actual y guardamos el usuario con perfil actualizado
        const authStore = useAuthStore.getState();
        if (authStore.token) {
           await setSession(authStore.token, response.data.user, authStore.refreshToken);
        }
        setStep(4);
      } else {
        throw new Error("El servidor no retornó el usuario actualizado.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "No se pudo guardar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERS DE PASOS ---

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Qué vas a preparar?</Text>
      <Text style={styles.stepSubtitle}>Selecciona las materias a las que te presentas en la PAU.</Text>
      
      {isLoadingSubjects ? (
        <ActivityIndicator size="large" color={theme.colors.brandBlue} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.subjectsList}>
          <View style={styles.subjectsGrid}>
            {subjects.map(sub => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <TouchableOpacity 
                  key={sub.id} 
                  style={[styles.subjectItem, isSelected && styles.subjectItemSelected]}
                  onPress={() => handleToggleSubject(sub.id)}
                  activeOpacity={0.7}
                >
                  <BookOpen size={24} color={isSelected ? theme.colors.brandBlue : "#64748b"} />
                  <Text style={[styles.subjectText, isSelected && styles.subjectTextSelected]}>{sub.name}</Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <CheckCircle2 size={16} color={theme.colors.brandBlue} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity 
        style={[styles.primaryButton, selectedSubjects.length === 0 && styles.buttonDisabled]} 
        onPress={() => setStep(2)}
      >
        <Text style={styles.primaryButtonText}>Continuar</Text>
        <ChevronRight size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tus Metas</Text>
      <Text style={styles.stepSubtitle}>Ayúdanos a personalizar tu ritmo de estudio.</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Horas de estudio a la semana (aprox.)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 10 horas"
          value={weeklyHours}
          onChangeText={setWeeklyHours}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>¿Cómo nos conociste?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. TikTok, un amigo, profesor..."
          value={referralSource}
          onChangeText={setReferralSource}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
          <ChevronLeft size={20} color="#64748b" />
          <Text style={styles.secondaryButtonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => setStep(3)}>
          <Text style={styles.primaryButtonText}>Continuar</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Crea tu Perfil</Text>
      <Text style={styles.stepSubtitle}>Así te verán otros estudiantes en los rankings.</Text>
      
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage} disabled={isUploadingAvatar}>
          {avatarUri || avatarUrl ? (
            <Image source={{ uri: avatarUri || avatarUrl }} style={styles.avatarImage} />
          ) : (
            <UserRound size={40} color="#94a3b8" />
          )}
          {isUploadingAvatar && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <ImageIcon size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarLabel}>Toca para cambiar</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>@username</Text>
        <TextInput
          style={[styles.input, usernameError ? styles.inputError : null]}
          placeholder="ej. pablo_02"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {usernameError ? (
          <Text style={styles.errorHelperText}>{usernameError}</Text>
        ) : isUsernameAvailable && normalizedUsername.length >= 3 ? (
          <Text style={styles.successHelperText}>¡Nombre disponible!</Text>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Biografía (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Estudiando duro para Ingeniería..."
          value={bio}
          onChangeText={setBio}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Universidad o Grado Objetivo (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Medicina en la UCM"
          value={targetUniversity}
          onChangeText={setTargetUniversity}
        />
      </View>
      
      {submitError && (
        <Text style={styles.submitErrorText}>{submitError}</Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(2)}>
          <ChevronLeft size={20} color="#64748b" />
          <Text style={styles.secondaryButtonText}>Atrás</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { flex: 1 }, (!isUsernameAvailable || normalizedUsername.length < 3 || isSubmitting) && styles.buttonDisabled]} 
          onPress={handleFinishOnboarding}
          disabled={!isUsernameAvailable || normalizedUsername.length < 3 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Finalizar</Text>
              <CheckCircle2 size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={[styles.stepContainer, styles.successContainer]}>
      <View style={styles.successIconWrapper}>
        <Trophy size={60} color="#f59e0b" />
      </View>
      <Text style={styles.successTitle}>¡Todo listo, {username}!</Text>
      <Text style={styles.successSubtitle}>Tu perfil ha sido creado. Ya puedes empezar a practicar y subir en el ranking.</Text>
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => router.replace("/(tabs)/dashboard")}
      >
        <Text style={styles.primaryButtonText}>Ir a mi Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Progress Bar Header */}
          {step < 4 && (
            <View style={styles.header}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
              </View>
              <Text style={styles.stepIndicatorText}>Paso {step} de 3</Text>
            </View>
          )}

          <View style={styles.card}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.space4,
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 4,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 24,
    lineHeight: 22,
  },
  subjectsList: {
    maxHeight: 400,
    marginBottom: 24,
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  subjectItem: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#f1f5f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    position: "relative",
  },
  subjectItemSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: "#eff6ff",
  },
  subjectText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  subjectTextSelected: {
    color: theme.colors.brandBlue,
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#0f172a",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorHelperText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  successHelperText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.brandBlue,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  avatarLabel: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  submitErrorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
});
