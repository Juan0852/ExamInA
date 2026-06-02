import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { apiService } from "../shared/services/api.service";
import { fileUploadService } from "../shared/services/file-upload.service";
import { useQuery } from "@tanstack/react-query";
import { useAchievementToasts } from "../shared/achievements/achievement-toast.store";
import type { AchievementsResponse } from "../shared/achievements/types";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  Atom,
  Dna,
  FlaskConical,
  Flame,
  Languages,
  Book,
  UserRound,
  Image,
  Trophy,
  UploadCloud,
  GraduationCap,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface SubjectsApiResponse {
  data: Subject[];
}

interface UsernameAvailabilityResponse {
  data: {
    available: boolean;
  };
}



export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setSession, token } = useAuthStore();
  const pushAchievementToasts = useAchievementToasts();
  
  // Paso actual: 1 (Asignaturas), 2 (Horas), 3 (Referencia), 4 (Perfil), 5 (Completado)
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<string>("");
  const [referralSource, setReferralSource] = useState<string>("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.photoUrl || "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(user?.photoUrl || null);
  const [avatarFileName, setAvatarFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedUsername = username.trim().toLowerCase();

  // Redirigir si no hay sesión activa
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Cargar asignaturas reales del backend
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery<SubjectsApiResponse, Error>({
    queryKey: ["subjects-onboarding"],
    queryFn: () => apiService.get<SubjectsApiResponse>("/subjects"),
    enabled: !!token,
  });

  // Lista de asignaturas fallback por si la base de datos está vacía o no responde
  const fallbackSubjects: Subject[] = [
    { id: "sub-1", name: "Matemáticas II", slug: "matematicas-ii" },
    { id: "sub-2", name: "Física", slug: "fisica" },
    { id: "sub-3", name: "Química", slug: "quimica" },
    { id: "sub-4", name: "Biología", slug: "biologia" },
    { id: "sub-5", name: "Lengua Castellana y Literatura II", slug: "lengua" },
    { id: "sub-6", name: "Inglés II", slug: "ingles" },
  ];

  const subjects = subjectsData?.data && subjectsData.data.length > 0 
    ? subjectsData.data 
    : fallbackSubjects;

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Obtener el icono correspondiente a la asignatura (SVG personalizado)
  const getSubjectIcon = (name: string): string => {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (slug.includes("matemat")) return "/brand/subjects/matematicas.svg";
    if (slug.includes("biolog")) return "/brand/subjects/biologia.svg";
    if (slug.includes("fisic")) return "/brand/subjects/fisica.svg";
    if (slug.includes("quimic")) return "/brand/subjects/quimica.svg";
    if (slug.includes("lengua") || slug.includes("literatura")) return "/brand/subjects/lengua.svg";
    if (slug.includes("ingles")) return "/brand/subjects/ingles.svg";
    if (slug.includes("filosof")) return "/brand/subjects/filosofia.svg";
    if (slug.includes("geograf")) return "/brand/subjects/geografia.svg";
    if (slug.includes("latin")) return "/brand/subjects/latin.svg";
    if (slug.includes("dibujo")) return "/brand/subjects/dibujo-tecnico.svg";
    if (slug.includes("economia")) return "/brand/subjects/economia.svg";
    if (slug.includes("tecnolo") || slug.includes("ingenier")) return "/brand/subjects/tecnologia.svg";
    if (slug.includes("histor")) return "/brand/subjects/historia.svg";
    return "/brand/subjects/matematicas.svg"; // fallback
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSubjects.length === 0) {
      // Permitir continuar, pero es mejor que seleccionen al menos una
      setStep(2);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const usernameAvailabilityQuery = useQuery<UsernameAvailabilityResponse, Error>({
    queryKey: ["username-availability", normalizedUsername],
    queryFn: () =>
      apiService.get<UsernameAvailabilityResponse>(
        `/auth/profile/username-availability?username=${encodeURIComponent(normalizedUsername)}`
      ),
    enabled: step === 4 && normalizedUsername.length >= 3 && !!token,
    staleTime: 5_000,
  });

  const isUsernameFormatValid = /^[a-z0-9_]+$/.test(normalizedUsername);
  const isUsernameAvailable = usernameAvailabilityQuery.data?.data.available !== false;
  const usernameError =
    normalizedUsername.length > 0 && normalizedUsername.length < 3
      ? "El nombre público debe tener al menos 3 caracteres."
      : normalizedUsername.length >= 3 && !isUsernameFormatValid
      ? "Usa solo letras minúsculas, números y guiones bajos."
      : normalizedUsername.length >= 3 && usernameAvailabilityQuery.data?.data.available === false
      ? "Ese nombre ya está siendo utilizado por alguien más."
      : null;

  const hasAvatar = Boolean(avatarPreviewUrl);
  const isProfileNameReady =
    normalizedUsername.length >= 3 &&
    isUsernameFormatValid &&
    isUsernameAvailable &&
    !usernameAvailabilityQuery.isFetching;
  const profileCompletion =
    (isProfileNameReady ? 40 : 0) +
    (bio.trim().length >= 24 ? 40 : 0) +
    (hasAvatar ? 20 : 0);

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinishOnboarding = async () => {
    if (!referralSource) {
      setSubmitError("Por favor, dinos dónde nos conociste.");
      return;
    }

    if (isUploadingAvatar) {
      setSubmitError("Espera a que se suba la imagen de perfil.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Guardar preferencias y perfil del usuario al cerrar el onboarding de forma atómica.
      const response = await apiService.post<{
        data: {
          user: typeof user;
        };
      }>("/auth/onboarding/complete", {
        displayName: normalizedUsername,
        username: normalizedUsername,
        bio: bio.trim(),
        targetUniversity: targetUniversity.trim(),
        photoUrl: avatarUrl.trim(),
        preferredSubjects: selectedSubjects,
        weeklyStudyHours: weeklyHours,
        referralSource: referralSource,
      });

      // Actualizar Zustand store con el usuario actualizado
      if (user && response.data?.user) {
        setSession(token || "", response.data.user);
      }

      const achievementsResponse = await apiService.post<AchievementsResponse>("/achievements/me/evaluate");
      pushAchievementToasts(achievementsResponse.meta.newlyUnlockedAchievements ?? []);

      setStep(5);
    } catch (err: any) {
      setSubmitError(err.message || "Error al guardar tus preferencias. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
    setAvatarFileName(file.name);
    setIsUploadingAvatar(true);

    try {
      const result = await fileUploadService.uploadImage(file, "AVATAR");
      setAvatarUrl(result.url);
    } catch {
      setAvatarUrl("");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Opciones de horas de estudio semanales
  const hoursOptions = [
    {
      id: "casual",
      label: "🚀 Casual",
      desc: "1-3 horas por semana",
      hours: "1-3",
    },
    {
      id: "constant",
      label: "⚡ Constante",
      desc: "4-7 horas por semana",
      hours: "4-7",
    },
    {
      id: "intense",
      label: "🔥 Intenso",
      desc: "8-12 horas por semana",
      hours: "8-12",
    },
    {
      id: "unstoppable",
      label: "🧠 Imparable",
      desc: "Más de 12 horas por semana",
      hours: "12+",
    },
  ];

  // Opciones de origen / dónde nos conoció
  const referralOptions = [
    { id: "tiktok", label: "📱 TikTok" },
    { id: "instagram", label: "📸 Instagram" },
    { id: "friends", label: "👥 Amigo / Compañero" },
    { id: "google", label: "🔍 Buscador de Google" },
    { id: "teacher", label: "🏫 Profesor / Colegio" },
    { id: "other", label: "🌐 Otro sitio web" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111F] text-slate-800 dark:text-slate-200 flex flex-col justify-between transition-colors duration-200">
      {/* Header simple */}
      <header className="py-6 px-8 border-b border-slate-200 dark:border-brand-navy/20 bg-white/80 dark:bg-[#07111F]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <img
            src="/brand/examina-logo-transparent-cropped.png"
            alt="ExamInA"
            className="h-10 w-auto"
          />
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-brand-navy/30 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Usuario:</span>
            <span className="text-brand-blue dark:text-brand-cyan">{user?.email}</span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-[#0E1B2F] rounded-3xl shadow-xl border border-slate-200/60 dark:border-brand-navy/30 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
          
          {step < 5 && (
            <>
              {/* Barra de progreso de onboarding */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                  <span>PASO {step} DE 4</span>
                  <span>{Math.round(((step - 1) / 4) * 100)}% Completado</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#12243B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500"
                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Errores */}
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-650 dark:text-red-400 text-xs font-semibold">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </>
          )}

          {/* PASO 1: ASIGNATURAS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 rounded-full text-xs font-bold text-brand-blue dark:text-brand-cyan mb-3">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Personaliza tu catálogo</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                  ¿Qué asignaturas quieres estudiar?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Elige las asignaturas PAU que estás preparando. Podrás cambiar esto más adelante en tu configuración.
                </p>
              </div>

              {isLoadingSubjects ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                  <span className="text-xs text-slate-400 font-semibold">Cargando asignaturas disponibles...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleToggleSubject(sub.id)}
                        className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-brand-sky/20 dark:bg-brand-blue/10 border-brand-blue dark:border-brand-cyan shadow-sm cursor-pointer"
                            : "bg-slate-50 dark:bg-[#12243B] border-slate-200 dark:border-brand-navy/35 hover:border-slate-300 dark:hover:border-brand-navy/60 cursor-pointer"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className={`h-14 w-14 min-w-14 max-w-14 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-brand-sky/30 dark:bg-brand-navy/40`}>
                            <img src={getSubjectIcon(sub.name)} alt={sub.name} className="h-10 w-10 min-w-10 max-w-10 shrink-0 object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="min-w-0 text-sm font-bold text-slate-800 dark:text-white break-words">
                                {sub.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-blue dark:text-brand-cyan flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextStep}
                  disabled={selectedSubjects.length === 0}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  Continuar
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: HORAS DE ESTUDIO */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 rounded-full text-xs font-bold text-brand-blue dark:text-brand-cyan mb-3">
                  <Flame size={12} />
                  <span>Estilo de estudio</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                  ¿Cuántas horas esperas estudiar por semana?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Esto nos ayudará a configurar tus logros, objetivos de estudio diarios y medallas personalizadas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hoursOptions.map((opt) => {
                  const isSelected = weeklyHours === opt.hours;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setWeeklyHours(opt.hours)}
                      className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-brand-sky/20 dark:bg-brand-blue/10 border-brand-blue dark:border-brand-cyan shadow-sm"
                          : "bg-slate-50 dark:bg-[#12243B] border-slate-200 dark:border-brand-navy/35 hover:border-slate-300 dark:hover:border-brand-navy/60"
                      }`}
                    >
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={handlePrevStep}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Atrás
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!weeklyHours}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  Continuar
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: DÓNDE NOS CONOCISTE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 rounded-full text-xs font-bold text-brand-blue dark:text-brand-cyan mb-3">
                  <HelpCircle size={12} />
                  <span>Ayúdanos a crecer</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                  ¿Dónde nos conociste?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Nos encanta saber de dónde vienen nuestros estudiantes para seguir mejorando.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {referralOptions.map((opt) => {
                  const isSelected = referralSource === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setReferralSource(opt.id)}
                      className={`p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-brand-sky/20 dark:bg-brand-blue/10 border-brand-blue dark:border-brand-cyan shadow-sm"
                          : "bg-slate-50 dark:bg-[#12243B] border-slate-200 dark:border-brand-navy/35 hover:border-slate-300 dark:hover:border-brand-navy/60"
                      }`}
                    >
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Atrás
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!referralSource}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  Continuar
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: PERFIL */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-sky dark:bg-brand-navy/40 border border-brand-blue/20 rounded-full text-xs font-bold text-brand-blue dark:text-brand-cyan mb-3">
                  <Trophy size={12} />
                  <span>Logro de perfil</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                  Completa tu perfil
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Añade una presentación corta y una imagen para que otros estudiantes puedan reconocerte cuando publiques, compartas exámenes o conectes con la comunidad.
                </p>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <UserRound size={14} />
                    Nombre público
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    maxLength={32}
                    placeholder="Ej: examina_student"
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:bg-white dark:bg-[#12243B] dark:text-white ${
                      usernameError
                        ? "border-red-300 focus:border-red-500 dark:border-red-900/60 dark:focus:border-red-400"
                        : "border-slate-200 focus:border-brand-blue dark:border-brand-navy/35 dark:focus:border-brand-cyan"
                    }`}
                  />
                  <div className="mt-1 min-h-4 text-[11px] font-semibold">
                    {usernameError ? (
                      <span className="text-red-500">{usernameError}</span>
                    ) : normalizedUsername.length >= 3 && usernameAvailabilityQuery.isFetching ? (
                      <span className="text-slate-400">Comprobando disponibilidad...</span>
                    ) : normalizedUsername.length >= 3 ? (
                      <span className="text-green-500">Nombre público disponible.</span>
                    ) : (
                      <span className="text-slate-400">Será visible para otros estudiantes en posts, comentarios y exámenes compartidos.</span>
                    )}
                  </div>
                </label>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-[150px_1fr] sm:items-start">
                  <div className="mx-auto w-full max-w-[170px] sm:mx-0">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <Image size={14} />
                      Foto de perfil
                    </span>
                    <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-brand-blue hover:bg-white dark:border-brand-navy/40 dark:bg-[#12243B] dark:hover:border-brand-cyan">
                      {avatarPreviewUrl ? (
                        <img src={avatarPreviewUrl} alt="Vista previa del perfil" className="h-full w-full object-cover" />
                      ) : normalizedUsername ? (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-blue to-brand-cyan text-white">
                          <span className="text-6xl font-black uppercase">{normalizedUsername.charAt(0)}</span>
                          <span className="mt-2 text-xs font-black uppercase tracking-wide text-white/85">Foto de perfil</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center px-4">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sky text-brand-blue transition group-hover:scale-105 dark:bg-brand-navy/40 dark:text-brand-cyan">
                            <UploadCloud size={24} />
                          </div>
                          <span className="text-xs font-black text-brand-navy dark:text-white">Foto de perfil</span>
                          <span className="mt-1 text-[11px] font-semibold text-slate-400">PNG, JPG o WEBP</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-brand-blue shadow-lg shadow-brand-blue/15 transition group-hover:scale-105 dark:bg-[#07111F]/95 dark:text-brand-cyan">
                        <UploadCloud size={18} />
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />
                    </label>
                    {avatarFileName && (
                      <p className="mt-2 truncate text-[11px] font-semibold text-slate-400">
                        {avatarFileName}
                      </p>
                    )}
                  </div>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <BookOpen size={14} />
                      Descripción
                    </span>
                    <textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      maxLength={240}
                      rows={6}
                      placeholder="Cuenta qué estás preparando, tus materias fuertes o qué tipo de compañeros de estudio quieres encontrar."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/35 dark:bg-[#12243B] dark:text-white dark:focus:border-brand-cyan"
                    />
                    <span className="mt-1 block text-right text-[11px] font-semibold text-slate-400">
                      {bio.length}/240
                    </span>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <GraduationCap size={14} />
                    Universidad objetivo
                    <span className="normal-case tracking-normal text-slate-400">(opcional)</span>
                  </span>
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(event) => setTargetUniversity(event.target.value)}
                    maxLength={100}
                    placeholder="Ej: Universidad Complutense, UPM, no lo tengo claro todavía..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/35 dark:bg-[#12243B] dark:text-white dark:focus:border-brand-cyan"
                  />
                  <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                    Nos ayuda a personalizar objetivos y comunidad, pero puedes dejarlo vacío.
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border border-brand-blue/15 bg-brand-sky/20 dark:bg-brand-blue/10 dark:border-brand-cyan/20 p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-blue dark:text-brand-cyan" />
                    <span className="text-xs font-black uppercase tracking-wide text-brand-navy dark:text-white">
                      Perfil al {profileCompletion}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Meta: 80%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white dark:bg-[#12243B]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Si no quieres completar tu perfil ahora no pasa nada: puedes continuar solo con tu nombre público. El logro se desbloquea al completar nombre, descripción e imagen.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Atrás
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  disabled={!isProfileNameReady || Boolean(usernameError) || isSubmitting}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      Finalizar
                      <ThumbsUp size={16} className="ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 5: COMPLETADO */}
          {step === 5 && (
            <div className="text-center py-10 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full text-green-500 mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                  ¡Todo configurado!
                </h1>
                <p className="max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Hemos personalizado tu experiencia de estudio según tus necesidades. ¡Ya estás listo para empezar a practicar y ganar tus primeros logros!
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Entrar al Panel de Control
                  <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-brand-navy/20 bg-white/40 dark:bg-[#07111F]/20">
        &copy; {new Date().getFullYear()} ExamInA. Todos los derechos reservados.
      </footer>
    </div>
  );
}
