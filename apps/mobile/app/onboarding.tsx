import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Trophy,
  UploadCloud,
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../src/services/api.service";
import { fileUploadService } from "../src/services/file-upload.service";
import { useAuthStore, type User } from "../src/stores/auth.store";
import { theme } from "../src/theme";
import { SubjectIcons } from "../src/utils/SubjectIcons";

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

interface AchievementDto {
  code: string;
  title: string;
  experienceReward: number;
}

interface AchievementEvaluationResponse {
  data: AchievementDto[];
  meta: {
    newlyUnlockedAchievements: AchievementDto[];
  };
  error: null;
}

const TOTAL_STEPS = 4;

const studyOptionImages = {
  casual: require("../assets/onboarding/study-casual.png"),
  constant: require("../assets/onboarding/study-constant.png"),
  intense: require("../assets/onboarding/study-intense.png"),
  unstoppable: require("../assets/onboarding/study-unstoppable.png"),
};

const studyHourOptions = [
  {
    id: "casual",
    image: studyOptionImages.casual,
    title: "Casual",
    description: "1 a 3 horas por semana",
    value: "1-3",
    accent: "#10B981",
    background: "#ECFDF5",
  },
  {
    id: "constant",
    image: studyOptionImages.constant,
    title: "Constante",
    description: "4 a 7 horas por semana",
    value: "4-7",
    accent: theme.colors.brandBlue,
    background: "#EAF6FF",
  },
  {
    id: "intense",
    image: studyOptionImages.intense,
    title: "Intenso",
    description: "8 a 12 horas por semana",
    value: "8-12",
    accent: "#F97316",
    background: "#FFF7ED",
  },
  {
    id: "unstoppable",
    image: studyOptionImages.unstoppable,
    title: "Imparable",
    description: "Mas de 12 horas por semana",
    value: "12+",
    accent: "#7C3AED",
    background: "#F3E8FF",
  },
];

const referralOptions = [
  { id: "tiktok", icon: "logo-tiktok", title: "TikTok", accent: "#111827", background: "#F3F4F6" },
  { id: "instagram", icon: "logo-instagram", title: "Instagram", accent: "#E4405F", background: "#FFF1F7" },
  { id: "friends", icon: "logo-whatsapp", title: "Amigo", accent: "#25D366", background: "#ECFDF5" },
  { id: "google", icon: "logo-google", title: "Google", accent: "#4285F4", background: "#EFF6FF" },
  { id: "teacher", icon: "school", title: "Profesor", accent: "#F97316", background: "#FFF7ED" },
  { id: "other", icon: "globe-outline", title: "Otro sitio", accent: "#64748B", background: "#F8FAFC" },
];

function normalizeUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

function getInitialUsername(user: User | null): string {
  if (user?.profile?.username) return user.profile.username;
  const source = user?.displayName || user?.email?.split("@")[0] || "";
  return normalizeUsername(source);
}

function getImageContentType(fileName: string, mimeType?: string | null): string {
  if (mimeType) return mimeType;
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

function OnboardingBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.badge}>
      {icon}
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, token, refreshToken, setSession } = useAuthStore();

  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [username, setUsername] = useState(() => getInitialUsername(user));
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [targetUniversity, setTargetUniversity] = useState(user?.profile?.targetUniversity ?? "");
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(user?.photoUrl ?? null);
  const [avatarUrl, setAvatarUrl] = useState(user?.photoUrl ?? "");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedUsername = normalizeUsername(username.trim());
  const currentUsername = user?.profile?.username ?? "";
  const hasAvatar = Boolean(avatarUrl);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  const {
    data: subjectsData,
    isError: isSubjectsError,
    isLoading: isLoadingSubjects,
    isRefetching: isRefetchingSubjects,
    refetch: refetchSubjects,
  } = useQuery<SubjectsApiResponse, Error>({
    queryKey: ["subjects-onboarding"],
    queryFn: () => apiService.get<SubjectsApiResponse>("/subjects"),
    enabled: Boolean(token),
    retry: 1,
  });

  const subjects = subjectsData?.data ?? [];

  const usernameAvailabilityQuery = useQuery<UsernameAvailabilityResponse, Error>({
    queryKey: ["username-availability", normalizedUsername],
    queryFn: () =>
      apiService.get<UsernameAvailabilityResponse>(
        `/auth/profile/username-availability?username=${encodeURIComponent(normalizedUsername)}`
      ),
    enabled: step === 4 && normalizedUsername.length >= 3 && Boolean(token),
    staleTime: 5_000,
  });

  const isUsernameFormatValid = /^[a-z0-9_]+$/.test(normalizedUsername);
  const isOwnCurrentUsername = normalizedUsername === currentUsername;
  const hasCheckedUsername = isOwnCurrentUsername || usernameAvailabilityQuery.isSuccess;
  const isUsernameAvailable =
    usernameAvailabilityQuery.data?.data.available ?? isOwnCurrentUsername;
  const usernameError =
    normalizedUsername.length > 0 && normalizedUsername.length < 3
      ? "El nombre debe tener al menos 3 caracteres."
      : normalizedUsername.length >= 3 && !isUsernameFormatValid
      ? "Usa solo letras minusculas, numeros y guiones bajos."
      : normalizedUsername.length >= 3 && usernameAvailabilityQuery.data?.data.available === false
      ? "Ese nombre ya esta siendo utilizado por alguien mas."
      : null;

  const isProfileNameReady =
    normalizedUsername.length >= 3 &&
    isUsernameFormatValid &&
    hasCheckedUsername &&
    isUsernameAvailable &&
    !usernameAvailabilityQuery.isFetching;

  const profileCompletion = useMemo(() => {
    return (
      (isProfileNameReady ? 40 : 0) +
      (bio.trim().length >= 24 ? 40 : 0) +
      (hasAvatar ? 20 : 0)
    );
  }, [bio, hasAvatar, isProfileNameReady]);

  const progressPercent = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const goNext = () => {
    setSubmitError(null);
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };

  const goBack = () => {
    setSubmitError(null);
    setStep((current) => Math.max(1, current - 1));
  };

  const pickAvatar = async () => {
    setSubmitError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tus fotos para seleccionar una imagen de perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || asset.uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const contentType = getImageContentType(fileName, asset.mimeType);

    setAvatarPreviewUri(asset.uri);
    setAvatarFileName(fileName);
    setIsUploadingAvatar(true);

    try {
      const uploaded = await fileUploadService.uploadLocalImage({
        uri: asset.uri,
        fileName,
        contentType,
        purpose: "AVATAR",
        visibility: "PUBLIC",
        width: asset.width,
        height: asset.height,
      });
      setAvatarUrl(uploaded.url);
    } catch (error) {
      setAvatarUrl(user?.photoUrl ?? "");
      setSubmitError("No se pudo subir la foto. Puedes continuar sin imagen o intentar otra vez.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const finishOnboarding = async () => {
    if (selectedSubjects.length === 0) {
      setSubmitError("Selecciona al menos una asignatura para personalizar tu temario.");
      setStep(1);
      return;
    }

    if (!weeklyHours) {
      setSubmitError("Elige un ritmo semanal de estudio.");
      setStep(2);
      return;
    }

    if (!referralSource) {
      setSubmitError("Selecciona donde conociste ExamInA.");
      setStep(3);
      return;
    }

    if (!isProfileNameReady || usernameError) {
      setSubmitError("Revisa el nombre publico antes de finalizar.");
      setStep(4);
      return;
    }

    if (isUploadingAvatar) {
      setSubmitError("Espera a que termine de subirse tu imagen.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiService.post<{ data: { user: User }; meta: Record<string, unknown>; error: null }>(
        "/auth/onboarding/complete",
        {
          displayName: normalizedUsername,
          username: normalizedUsername,
          bio: bio.trim(),
          targetUniversity: targetUniversity.trim(),
          photoUrl: avatarUrl.trim(),
          preferredSubjects: selectedSubjects,
          weeklyStudyHours: weeklyHours,
          referralSource,
        }
      );

      if (!response.data.user) {
        throw new Error("El servidor no retorno el usuario actualizado.");
      }

      const currentToken = useAuthStore.getState().token || token;
      const currentRefreshToken = useAuthStore.getState().refreshToken || refreshToken;
      if (currentToken) {
        await setSession(currentToken, response.data.user, currentRefreshToken);
      }

      try {
        await apiService.post<AchievementEvaluationResponse>("/achievements/me/evaluate");
      } catch {
        // Achievement toasts will be handled by the global mobile achievement system.
      }

      setStep(5);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubjectsStep = () => (
    <View style={styles.stepContainer}>
      <OnboardingBadge icon={<Sparkles size={13} color={theme.colors.brandBlue} />} label="Personaliza tu catalogo" />
      <Text style={styles.stepTitle}>Que asignaturas quieres estudiar?</Text>
      <Text style={styles.stepSubtitle}>
        Elige las asignaturas PAU que estas preparando. Esto alimenta tu temario, examenes y progreso inicial.
      </Text>

      {isLoadingSubjects ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.brandBlue} />
          <Text style={styles.centerStateText}>Cargando asignaturas disponibles...</Text>
        </View>
      ) : isSubjectsError || subjects.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={28} color={theme.colors.warning} />
          <Text style={styles.emptyStateTitle}>No pudimos cargar asignaturas reales.</Text>
          <Text style={styles.emptyStateText}>
            Revisa que la API este activa y vuelve a intentarlo. No usamos materias falsas en este flujo.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchSubjects()} disabled={isRefetchingSubjects}>
            {isRefetchingSubjects ? <ActivityIndicator color={theme.colors.brandBlue} /> : <Text style={styles.retryButtonText}>Reintentar</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.subjectsGrid}>
          {subjects.map((subject) => {
            const isSelected = selectedSubjects.includes(subject.id);
            const iconSource = SubjectIcons[subject.slug] || SubjectIcons.biologia;

            return (
              <TouchableOpacity
                key={subject.id}
                activeOpacity={0.8}
                style={[styles.subjectOption, isSelected && styles.subjectOptionSelected]}
                onPress={() => toggleSubject(subject.id)}
              >
                <View style={styles.subjectIconFrame}>
                  <ExpoImage source={iconSource} style={styles.subjectIcon} contentFit="contain" />
                </View>
                <Text style={[styles.subjectOptionText, isSelected && styles.subjectOptionTextSelected]} numberOfLines={2}>
                  {subject.name}
                </Text>
                {isSelected && (
                  <View style={styles.subjectCheck}>
                    <CheckCircle2 size={16} color={theme.colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, selectedSubjects.length === 0 && styles.buttonDisabled]}
        onPress={goNext}
        disabled={selectedSubjects.length === 0}
      >
        <Text style={styles.primaryButtonText}>Continuar</Text>
        <ChevronRight size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderStudyRhythmStep = () => (
    <View style={styles.stepContainer}>
      <OnboardingBadge icon={<Clock3 size={13} color={theme.colors.brandBlue} />} label="Ritmo de estudio" />
      <Text style={styles.stepTitle}>Cuantas horas quieres estudiar por semana?</Text>
      <Text style={styles.stepSubtitle}>
        Lo usamos para preparar objetivos razonables y medir tu avance sin llenarte de ruido.
      </Text>

      <View style={styles.optionsList}>
        {studyHourOptions.map((option) => {
          const isSelected = weeklyHours === option.value;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              style={[
                styles.optionRow,
                isSelected && {
                  borderColor: option.accent,
                  backgroundColor: option.background,
                },
              ]}
              onPress={() => setWeeklyHours(option.value)}
            >
              <View style={[styles.optionVisual, { backgroundColor: option.background }]}>
                <ExpoImage source={option.image} style={styles.optionImage} contentFit="contain" />
              </View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, isSelected && { color: option.accent }]}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={[styles.optionRadio, isSelected && { borderColor: option.accent, backgroundColor: option.accent }]}>
                {isSelected && <CheckCircle2 size={16} color={theme.colors.white} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
          <ChevronLeft size={20} color={theme.colors.textSoft} />
          <Text style={styles.secondaryButtonText}>Atras</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton, !weeklyHours && styles.buttonDisabled]}
          onPress={goNext}
          disabled={!weeklyHours}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
          <ChevronRight size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReferralStep = () => (
    <View style={styles.stepContainer}>
      <OnboardingBadge icon={<HelpCircle size={13} color={theme.colors.brandBlue} />} label="Ayudanos a crecer" />
      <Text style={styles.stepTitle}>Donde conociste ExamInA?</Text>
      <Text style={styles.stepSubtitle}>
        Esta respuesta nos ayuda a entender donde estan llegando estudiantes como tu.
      </Text>

      <View style={styles.referralGrid}>
        {referralOptions.map((option) => {
          const isSelected = referralSource === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              style={[
                styles.referralOption,
                isSelected && {
                  borderColor: option.accent,
                  backgroundColor: option.background,
                },
              ]}
              onPress={() => setReferralSource(option.id)}
            >
              <View
                style={[
                  styles.referralIconFrame,
                  { backgroundColor: option.background },
                  isSelected && { backgroundColor: theme.colors.white, borderColor: option.accent },
                ]}
              >
                <Ionicons
                  name={option.icon as React.ComponentProps<typeof Ionicons>["name"]}
                  size={28}
                  color={option.accent}
                />
              </View>
              <Text style={[styles.referralText, isSelected && { color: option.accent }]}>{option.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
          <ChevronLeft size={20} color={theme.colors.textSoft} />
          <Text style={styles.secondaryButtonText}>Atras</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton, !referralSource && styles.buttonDisabled]}
          onPress={goNext}
          disabled={!referralSource}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
          <ChevronRight size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileStep = () => {
    const avatarInitial = normalizedUsername.charAt(0) || "E";

    return (
      <View style={styles.stepContainer}>
        <OnboardingBadge icon={<Trophy size={13} color={theme.colors.brandBlue} />} label="Logro de perfil" />
        <Text style={styles.stepTitle}>Completa tu perfil</Text>
        <Text style={styles.stepSubtitle}>
          Esta parte es opcional salvo tu nombre publico. Si completas nombre, descripcion e imagen puedes desbloquear el logro de perfil.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre publico</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            placeholder="Ej: examina_student"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={(value) => setUsername(normalizeUsername(value))}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
          <Text style={[styles.helperText, usernameError ? styles.helperTextError : styles.helperTextMuted]}>
            {usernameError
              ? usernameError
              : normalizedUsername.length >= 3 && usernameAvailabilityQuery.isFetching
              ? "Comprobando disponibilidad..."
              : isProfileNameReady
              ? "Nombre publico disponible."
              : "Sera visible en posts, comentarios y examenes compartidos."}
          </Text>
        </View>

        <View style={styles.profileMediaRow}>
          <View style={styles.avatarColumn}>
            <Text style={styles.label}>Foto de perfil</Text>
            <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar} disabled={isUploadingAvatar} activeOpacity={0.8}>
              {avatarPreviewUri ? (
                <RNImage source={{ uri: avatarPreviewUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarInitial}>
                  <Text style={styles.avatarInitialText}>{avatarInitial.toUpperCase()}</Text>
                  <Text style={styles.avatarInitialLabel}>Foto</Text>
                </View>
              )}
              <View style={styles.avatarUploadBadge}>
                {isUploadingAvatar ? <ActivityIndicator size="small" color={theme.colors.white} /> : <UploadCloud size={18} color={theme.colors.white} />}
              </View>
            </TouchableOpacity>
            {avatarFileName ? <Text style={styles.avatarFileName} numberOfLines={1}>{avatarFileName}</Text> : null}
          </View>

          <View style={styles.bioColumn}>
            <Text style={styles.label}>Descripcion</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Cuenta que estas preparando, tus materias fuertes o que tipo de companeros quieres encontrar."
              placeholderTextColor="#94a3b8"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={240}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{bio.length}/240</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Universidad objetivo</Text>
          <View style={styles.inputIconRow}>
            <GraduationCap size={18} color={theme.colors.textSoft} />
            <TextInput
              style={styles.inputIconText}
              placeholder="Ej: UCM, UPM, Medicina, no lo tengo claro todavia..."
              placeholderTextColor="#94a3b8"
              value={targetUniversity}
              onChangeText={setTargetUniversity}
              maxLength={100}
            />
          </View>
          <Text style={styles.helperTextMuted}>Puedes dejarlo vacio y completarlo despues.</Text>
        </View>

        <View style={styles.profileProgressBox}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <CheckCircle2 size={16} color={theme.colors.brandBlue} />
              <Text style={styles.progressTitle}>Perfil al {profileCompletion}%</Text>
            </View>
            <Text style={styles.progressGoal}>Meta: 80%</Text>
          </View>
          <View style={styles.profileProgressTrack}>
            <View style={[styles.profileProgressFill, { width: `${profileCompletion}%` }]} />
          </View>
          <Text style={styles.profileProgressHint}>
            Si no quieres completar el perfil ahora no pasa nada: puedes continuar solo con tu nombre, pero no ganas el logro.
          </Text>
        </View>

        {submitError && (
          <View style={styles.inlineError}>
            <AlertCircle size={18} color={theme.colors.danger} />
            <Text style={styles.inlineErrorText}>{submitError}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={goBack} disabled={isSubmitting}>
            <ChevronLeft size={20} color={theme.colors.textSoft} />
            <Text style={styles.secondaryButtonText}>Atras</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              styles.flexButton,
              (!isProfileNameReady || Boolean(usernameError) || isSubmitting || isUploadingAvatar) && styles.buttonDisabled,
            ]}
            onPress={finishOnboarding}
            disabled={!isProfileNameReady || Boolean(usernameError) || isSubmitting || isUploadingAvatar}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Finalizar</Text>
                <CheckCircle2 size={20} color={theme.colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuccessStep = () => (
    <View style={[styles.stepContainer, styles.successContainer]}>
      <View style={styles.successIconWrapper}>
        <Trophy size={58} color={theme.colors.warning} />
      </View>
      <Text style={styles.successTitle}>Todo configurado</Text>
      <Text style={styles.successSubtitle}>
        Tu experiencia ya quedo lista para empezar a practicar, medir progreso y desbloquear logros.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/(tabs)/dashboard")}>
        <Text style={styles.primaryButtonText}>Ir a mi dashboard</Text>
        <ChevronRight size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {step <= TOTAL_STEPS && (
            <View style={styles.header}>
              <View style={styles.headerTextRow}>
                <Text style={styles.stepIndicatorText}>Paso {step} de {TOTAL_STEPS}</Text>
                <Text style={styles.stepIndicatorText}>{progressPercent}% completado</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.card}>
            {step === 1 && renderSubjectsStep()}
            {step === 2 && renderStudyRhythmStep()}
            {step === 3 && renderReferralStep()}
            {step === 4 && renderProfileStep()}
            {step === 5 && renderSuccessStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.space4,
  },
  header: {
    marginBottom: theme.spacing.space5,
  },
  headerTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.space2,
  },
  stepIndicatorText: {
    color: "#7890AD",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: theme.radius.round,
    backgroundColor: "#E6EEF7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brandBlue,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: theme.spacing.space5,
    borderWidth: 1,
    borderColor: "#E1EAF4",
    ...theme.shadows.md,
  },
  stepContainer: {
    minHeight: 360,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brandSky,
    borderWidth: 1,
    borderColor: "#BFE6FF",
    paddingHorizontal: theme.spacing.space3,
    paddingVertical: 6,
    marginBottom: theme.spacing.space4,
  },
  badgeText: {
    color: theme.colors.brandBlue,
    fontSize: 12,
    fontWeight: "900",
  },
  stepTitle: {
    color: theme.colors.brandNavy,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    marginBottom: theme.spacing.space2,
  },
  stepSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginBottom: theme.spacing.space5,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    gap: theme.spacing.space3,
  },
  centerStateText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#FDE7B6",
    backgroundColor: "#FFFBEB",
    padding: theme.spacing.space5,
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginTop: theme.spacing.space3,
  },
  emptyStateText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: theme.spacing.space2,
  },
  retryButton: {
    minWidth: 120,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#FACC15",
    marginTop: theme.spacing.space4,
  },
  retryButtonText: {
    color: theme.colors.brandNavy,
    fontSize: 13,
    fontWeight: "900",
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.space3,
    marginBottom: theme.spacing.space5,
  },
  subjectOption: {
    width: "47.8%",
    minHeight: 142,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1EAF4",
    backgroundColor: "#F8FBFF",
    padding: theme.spacing.space3,
    position: "relative",
  },
  subjectOptionSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: "#EAF6FF",
  },
  subjectIconFrame: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.space2,
  },
  subjectIcon: {
    width: "100%",
    height: "100%",
  },
  subjectOptionText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  subjectOptionTextSelected: {
    color: theme.colors.brandBlue,
  },
  subjectCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandBlue,
  },
  optionsList: {
    gap: theme.spacing.space3,
    marginBottom: theme.spacing.space5,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1EAF4",
    backgroundColor: "#F8FBFF",
    padding: theme.spacing.space3,
    gap: theme.spacing.space3,
  },
  optionRowSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: "#EAF6FF",
  },
  optionVisual: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(8, 121, 242, 0.08)",
    overflow: "hidden",
  },
  optionImage: {
    width: 62,
    height: 62,
  },
  optionRadio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B7C6D8",
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.brandBlue,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  optionTitleSelected: {
    color: theme.colors.brandBlue,
  },
  optionDescription: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  referralGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.space3,
    marginBottom: theme.spacing.space5,
  },
  referralOption: {
    width: "47.8%",
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1EAF4",
    backgroundColor: "#F8FBFF",
    paddingHorizontal: theme.spacing.space2,
    paddingVertical: theme.spacing.space3,
  },
  referralOptionSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: "#EAF6FF",
  },
  referralIconFrame: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: theme.spacing.space2,
  },
  referralText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  referralTextSelected: {
    color: theme.colors.brandBlue,
  },
  formGroup: {
    marginBottom: theme.spacing.space4,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: theme.spacing.space2,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 50,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#DDE8F3",
    backgroundColor: "#F8FBFF",
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.space4,
    paddingVertical: theme.spacing.space3,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  helperText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  helperTextMuted: {
    color: "#8496AC",
  },
  helperTextError: {
    color: theme.colors.danger,
  },
  profileMediaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.space3,
    marginBottom: theme.spacing.space4,
  },
  avatarColumn: {
    width: 120,
  },
  avatarPicker: {
    width: 118,
    height: 118,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFD0E4",
    backgroundColor: "#F8FBFF",
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandBlue,
  },
  avatarInitialText: {
    color: theme.colors.white,
    fontSize: 48,
    fontWeight: "900",
  },
  avatarInitialLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  avatarUploadBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: theme.colors.brandBlue,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  avatarFileName: {
    color: "#8496AC",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },
  bioColumn: {
    flex: 1,
  },
  bioInput: {
    minHeight: 118,
    lineHeight: 19,
  },
  characterCount: {
    color: "#8496AC",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 4,
  },
  inputIconRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#DDE8F3",
    backgroundColor: "#F8FBFF",
    paddingHorizontal: theme.spacing.space4,
    gap: theme.spacing.space2,
  },
  inputIconText: {
    flex: 1,
    minHeight: 50,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  profileProgressBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFE6FF",
    backgroundColor: "#F0FAFF",
    padding: theme.spacing.space4,
    marginBottom: theme.spacing.space4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.space3,
    marginBottom: theme.spacing.space2,
  },
  progressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  progressTitle: {
    color: theme.colors.brandNavy,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  progressGoal: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: "900",
  },
  profileProgressTrack: {
    height: 8,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
  },
  profileProgressFill: {
    height: "100%",
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brandBlue,
  },
  profileProgressHint: {
    color: theme.colors.textSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: theme.spacing.space2,
  },
  inlineError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.space2,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    padding: theme.spacing.space3,
    marginBottom: theme.spacing.space4,
  },
  inlineErrorText: {
    flex: 1,
    color: theme.colors.danger,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.space3,
    marginTop: theme.spacing.space2,
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.space2,
    borderRadius: 16,
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: theme.spacing.space5,
  },
  flexButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.space2,
    borderRadius: 16,
    backgroundColor: "#EEF4FA",
    paddingHorizontal: theme.spacing.space4,
  },
  secondaryButtonText: {
    color: theme.colors.textSoft,
    fontSize: 15,
    fontWeight: "900",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.space8,
  },
  successIconWrapper: {
    width: 114,
    height: 114,
    borderRadius: 57,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7D8",
    marginBottom: theme.spacing.space5,
  },
  successTitle: {
    color: theme.colors.brandNavy,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: theme.spacing.space2,
  },
  successSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing.space5,
  },
});
