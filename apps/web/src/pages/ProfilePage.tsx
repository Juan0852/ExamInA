import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Sparkles, Trophy, Camera, Loader2, Edit, Users, MessageSquare, Heart, Lock, Globe, Shield, X, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { AchievementMedal } from "../shared/achievements/AchievementMedal";
import type { AchievementsResponse } from "../shared/achievements/types";
import { apiService } from "../shared/services/api.service";
import { fileUploadService } from "../shared/services/file-upload.service";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const editAvatarInputRef = useRef<HTMLInputElement>(null);
  const editBannerInputRef = useRef<HTMLInputElement>(null);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTargetUniversity, setEditTargetUniversity] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false);
  const [isUploadingEditBanner, setIsUploadingEditBanner] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEditModal = () => {
    setEditDisplayName(user?.displayName || "");
    setEditUsername(user?.profile?.username || "");
    setEditBio(user?.profile?.bio || "");
    setEditTargetUniversity(user?.profile?.targetUniversity || "");
    setEditPhotoUrl(user?.photoUrl || "");
    setEditBannerUrl(user?.profile?.bannerUrl || "");
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    const usernameRegex = /^[a-z0-9_]+$/;
    const cleanUsername = editUsername.trim().toLowerCase();

    if (cleanUsername && !usernameRegex.test(cleanUsername)) {
      setSaveError("El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos.");
      return;
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 32) {
      setSaveError("El nombre de usuario debe tener entre 3 y 32 caracteres.");
      return;
    }

    setIsSavingProfile(true);
    setSaveError(null);

    try {
      const response = await apiService.put<{
        data: {
          user: typeof user;
        };
      }>("/auth/profile", {
        displayName: editDisplayName.trim() || undefined,
        username: cleanUsername || undefined,
        bio: editBio.trim() || "",
        targetUniversity: editTargetUniversity.trim() || "",
        photoUrl: editPhotoUrl || "",
        bannerUrl: editBannerUrl || ""
      });

      setSession(token, response.data.user);
      setIsEditModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["achievements-me"] });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const achievementsQuery = useQuery<AchievementsResponse, Error>({
    queryKey: ["achievements-me"],
    queryFn: () => apiService.get<AchievementsResponse>("/achievements/me"),
    enabled: !!token,
    refetchOnMount: "always"
  });

  const myExamsQuery = useQuery({
    queryKey: ["my-exams"],
    queryFn: () => apiService.get<{ data: any[] }>("/shared-exams/me"),
    enabled: !!token
  });

  const myPostsQuery = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => apiService.get<{ data: any[] }>("/community/posts/me"),
    enabled: !!token
  });

  const myFriendsQuery = useQuery({
    queryKey: ["my-friends"],
    queryFn: () => apiService.get<{ data: any[] }>("/auth/friends"),
    enabled: !!token
  });

  const handleToggleVisibility = async (examId: string, currentVisibility: string) => {
    if (!token) return;
    const newVisibility = currentVisibility === "PRIVATE" ? "PUBLIC" : "PRIVATE";
    try {
      await apiService.patch(`/shared-exams/${examId}/visibility`, { visibility: newVisibility });
      await queryClient.invalidateQueries({ queryKey: ["my-exams"] });
    } catch (err) {
      console.error("Error changing visibility", err);
    }
  };

  const rawAchievements = achievementsQuery.data?.data ?? [];
  const unlockedAchievements = rawAchievements.filter((achievement) => achievement.unlocked);
  const totalXp = unlockedAchievements.reduce(
    (total, achievement) => total + achievement.experienceReward,
    0
  );

  const currentLevel = user?.profile?.level ?? 1;
  const currentXP = user?.profile?.experience ?? 0;
  const currentLevelBaseXP = 50 * (currentLevel - 1) * currentLevel;
  const nextLevelXP = 50 * currentLevel * (currentLevel + 1);
  const xpIntoCurrentLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const xpRequiredForNextLevel = nextLevelXP - currentLevelBaseXP;
  const progressPercentage = Math.min(100, Math.round((xpIntoCurrentLevel / xpRequiredForNextLevel) * 100));
  const xpRemaining = nextLevelXP - currentXP;

  const achievements = [...rawAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;

    const aIsSecret = a.code.startsWith("SECRET_");
    const bIsSecret = b.code.startsWith("SECRET_");

    if (a.unlocked) {
      if (a.experienceReward !== b.experienceReward) {
        return a.experienceReward - b.experienceReward;
      }
      return a.title.localeCompare(b.title);
    } else {
      if (aIsSecret && !bIsSecret) return 1;
      if (!aIsSecret && bIsSecret) return -1;

      if (a.experienceReward !== b.experienceReward) {
        return a.experienceReward - b.experienceReward;
      }
      return a.title.localeCompare(b.title);
    }
  });

  const handleEditImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    purpose: "AVATAR" | "BANNER"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("La imagen no puede superar 5 MB.");
      return;
    }

    if (purpose === "AVATAR") {
      setIsUploadingEditAvatar(true);
    } else {
      setIsUploadingEditBanner(true);
    }
    setSaveError(null);

    try {
      const result = await fileUploadService.uploadImage(file, purpose);
      if (purpose === "AVATAR") {
        setEditPhotoUrl(result.url);
      } else {
        setEditBannerUrl(result.url);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setIsUploadingEditAvatar(false);
      setIsUploadingEditBanner(false);
      e.currentTarget.value = "";
    }
  };

  const profileInitial = (user?.profile?.username || user?.displayName || user?.email || "E").charAt(0).toUpperCase();
  const profileBannerUrl = user?.profile?.bannerUrl || "/galaxy-banner.png";
  const editPreviewInitial = (editUsername || editDisplayName || user?.email || "E").charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-brand-blue/10 bg-white shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F]">
        <div className="relative">
          <div className="relative h-48 overflow-hidden bg-brand-navy sm:h-56">
            <img
              src={profileBannerUrl}
              alt="Portada del perfil"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/30 to-black/25" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
            <div className="absolute left-6 right-6 top-5 flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg backdrop-blur-md">
                Perfil ExamInA
              </span>
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/15 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition hover:bg-white/25 cursor-pointer"
              >
                <Edit size={14} className="text-brand-cyan" />
                Editar perfil
              </button>
            </div>
          </div>

          <div className="absolute left-6 top-48 z-20 -translate-y-1/2 sm:top-56">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName || "Perfil"}
                className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-2xl shadow-brand-blue/20 dark:border-[#0E1B2F] dark:bg-[#0E1B2F]"
              />
            ) : (
              <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-brand-blue to-brand-cyan text-4xl font-black text-white shadow-2xl shadow-brand-blue/20 dark:border-[#0E1B2F]">
                {profileInitial}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-20 sm:pl-44 sm:pt-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-brand-navy dark:text-white">
                    {user?.displayName || user?.profile?.username || "Estudiante"}
                  </h1>
                  {user?.profile?.username && user?.displayName && (
                    <span className="rounded-full bg-brand-sky px-2.5 py-1 text-xs font-extrabold tracking-wide text-brand-blue dark:bg-brand-blue/15 dark:text-brand-cyan">
                      @{user.profile.username}
                    </span>
                  )}
                  {user?.role && (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      user.role === "ADMIN"
                        ? "border-amber-300/40 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : user.role === "MODERATOR"
                        ? "border-indigo-300/40 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-brand-cyan/20 bg-brand-cyan/10 text-brand-blue dark:text-brand-cyan"
                    }`}>
                      {user.role === "ADMIN" && <Sparkles size={10} />}
                      {user.role === "MODERATOR" && <Shield size={10} />}
                      {user.role === "ADMIN" ? "Admin" : user.role === "MODERATOR" ? "Moderador" : "Estudiante"}
                    </span>
                  )}
                </div>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                  {user?.profile?.bio || "Tu vitrina de progreso, rachas y medallas desbloqueadas."}
                </p>
                {user?.profile?.targetUniversity && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-600 dark:bg-brand-navy/30 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    Universidad objetivo: <span className="text-brand-blue dark:text-brand-cyan">{user.profile.targetUniversity}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 pb-1 sm:pt-1">
              <button
                type="button"
                disabled
                aria-label="Cambio de tema bloqueado por ahora"
                className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm opacity-70 dark:border-brand-cyan/15 dark:bg-brand-navy/20 dark:text-slate-500 cursor-not-allowed"
                title="Cambio de tema bloqueado por ahora"
              >
                <Moon size={18} className="dark:hidden" />
                <Sun size={18} className="hidden dark:block" />
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-white bg-slate-900 text-white shadow-sm dark:border-[#0E1B2F]">
                  <Lock size={10} />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center dark:border-brand-cyan/10 dark:bg-brand-navy/25">
              <p className="text-2xl font-black text-brand-blue dark:text-brand-cyan">{unlockedAchievements.length}</p>
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Medallas</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center dark:border-brand-cyan/10 dark:bg-brand-navy/25">
              <p className="text-2xl font-black text-brand-blue dark:text-brand-cyan">{totalXp}</p>
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">XP logros</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-brand-cyan/10 dark:bg-brand-navy/25">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs font-black uppercase tracking-wider text-brand-navy dark:text-white">Nivel {currentLevel}</div>
                <div className="text-[10px] font-black text-amber-500">
                  Faltan {xpRemaining} XP
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-black/25">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400">
                <span>{currentLevelBaseXP}</span>
                <span>{currentXP} / {nextLevelXP}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Single-Screen Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Sidebar): Medallas & Amigos */}
        <div className="lg:col-span-1 space-y-6">
          <AchievementSection
            title="Medallas"
            description="Tu progreso y logros desbloqueados."
            achievements={achievements}
            isLoading={achievementsQuery.isLoading}
            isError={achievementsQuery.isError}
            errorText={achievementsQuery.error?.message}
            emptyText="No se encontraron medallas."
          />


          {/* Amigos Section */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] space-y-4">
            <div>
              <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
                <Users size={18} />
                <h2 className="text-xl font-black text-brand-navy dark:text-white">Amigos</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tus amigos y conexiones de estudio.
              </p>
            </div>

            {myFriendsQuery.isLoading ? (
              <div className="text-center text-xs font-bold text-slate-400 py-4">Cargando lista de amigos...</div>
            ) : myFriendsQuery.isError ? (
              <div className="text-center text-xs font-bold text-red-500 py-4">No se pudieron cargar tus amigos.</div>
            ) : !myFriendsQuery.data?.data || myFriendsQuery.data.data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
                <Users className="mx-auto h-6 w-6 text-brand-cyan" />
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">Aún no tienes amigos agregados.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {myFriendsQuery.data.data.map((friend: any) => (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className="rounded-2xl border border-slate-100 bg-white p-3 shadow-md shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] flex items-center gap-3 hover:border-brand-cyan/20 transition-all duration-300 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-brand-navy/35"
                  >
                    {friend.photoUrl ? (
                      <img
                        src={friend.photoUrl}
                        alt={friend.displayName || "Amigo"}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-brand-navy/30 shrink-0"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan text-white text-sm font-black uppercase shrink-0">
                        {(friend.username || friend.displayName || "?").charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <h3 className="text-xs font-black text-brand-navy dark:text-white truncate">
                          {friend.displayName || friend.username || "Usuario"}
                        </h3>
                        <span className="rounded-full bg-brand-sky dark:bg-brand-blue/15 px-1.5 py-0.2 text-[9px] font-black text-brand-blue dark:text-brand-cyan shrink-0">
                          Lv. {friend.level}
                        </span>
                      </div>
                      {friend.username && (
                        <p className="text-[10px] font-bold text-slate-400 truncate">
                          @{friend.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* Right Column (Main Content): Exámenes & Publicaciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mis Exámenes Section */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] space-y-4">
            <div>
              <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
                <CalendarDays size={18} />
                <h2 className="text-xl font-black text-brand-navy dark:text-white">Mis Exámenes Creados</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Exámenes que has diseñado. Alterna su privacidad para publicarlos o reservarlos.
              </p>
            </div>

            {myExamsQuery.isLoading ? (
              <div className="text-center text-xs font-bold text-slate-400 py-8">Cargando tus exámenes...</div>
            ) : myExamsQuery.isError ? (
              <div className="text-center text-xs font-bold text-red-500 py-8">No se pudieron cargar tus exámenes.</div>
            ) : !myExamsQuery.data?.data || myExamsQuery.data.data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
                <Sparkles className="mx-auto h-6 w-6 text-brand-cyan" />
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">No has creado ningún examen compartido todavía.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myExamsQuery.data.data.map((exam: any) => (
                  <article
                    key={exam.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          exam.visibility === "PUBLIC"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {exam.visibility === "PUBLIC" ? (
                            <>
                              <Globe size={9} />
                              Público
                            </>
                          ) : (
                            <>
                              <Lock size={9} />
                              Privado
                            </>
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {exam.questionCount} {exam.questionCount === 1 ? "pregunta" : "preguntas"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-black text-brand-navy dark:text-white line-clamp-1">
                        {exam.title}
                      </h3>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                        {exam.description || "Sin descripción."}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-brand-navy/20 flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-slate-400">
                        Creado el {new Date(exam.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleToggleVisibility(exam.id, exam.visibility)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition border cursor-pointer ${
                          exam.visibility === "PUBLIC"
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-950/20"
                            : "border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5 dark:border-brand-cyan/20 dark:text-brand-cyan dark:hover:bg-brand-cyan/10"
                        }`}
                      >
                        {exam.visibility === "PUBLIC" ? "Hacer Privado" : "Hacer Público"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Mis Publicaciones Section */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] space-y-4">
            <div>
              <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
                <MessageSquare size={18} />
                <h2 className="text-xl font-black text-brand-navy dark:text-white">Mis Publicaciones</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tus aportaciones, preguntas y respuestas compartidas en el foro de la comunidad.
              </p>
            </div>

            {myPostsQuery.isLoading ? (
              <div className="text-center text-xs font-bold text-slate-400 py-8">Cargando publicaciones...</div>
            ) : myPostsQuery.isError ? (
              <div className="text-center text-xs font-bold text-red-500 py-8">No se pudieron cargar tus publicaciones.</div>
            ) : !myPostsQuery.data?.data || myPostsQuery.data.data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
                <Sparkles className="mx-auto h-6 w-6 text-brand-cyan" />
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">No has publicado nada en la comunidad todavía.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPostsQuery.data.data.map((post: any) => (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] flex flex-col gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue dark:text-brand-cyan bg-brand-sky dark:bg-brand-blue/15 px-2 py-0.5 rounded-full">
                          {post.type}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()} a las {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {post.title && (
                        <h3 className="mt-1.5 text-sm font-black text-brand-navy dark:text-white">
                          {post.title}
                        </h3>
                      )}
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-50 dark:border-brand-navy/20 flex items-center gap-4 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} className="text-slate-400" />
                        {post.commentsCount} {post.commentsCount === 1 ? "Comentario" : "Comentarios"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={11} className="text-red-400" />
                        {post.reactionsCount} {post.reactionsCount === 1 ? "Reacción" : "Reacciones"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="my-6 w-full max-w-2xl scale-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-brand-cyan/15 dark:bg-[#0E1B2F] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-brand-navy/30">
              <div>
                <h2 className="text-lg font-black text-brand-navy dark:text-white">
                  Editar perfil
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ajusta tu portada, foto y datos públicos.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-brand-navy/30 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-5">
                {saveError && (
                  <div className="mb-5 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-500 dark:bg-red-950/20 dark:text-red-400">
                    {saveError}
                  </div>
                )}

                <div className="relative overflow-visible rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-brand-cyan/15 dark:bg-brand-navy/20">
                  <button
                    type="button"
                    onClick={() => editBannerInputRef.current?.click()}
                    disabled={isUploadingEditBanner || isSavingProfile}
                    className="group relative h-40 w-full overflow-hidden rounded-3xl text-left disabled:cursor-not-allowed disabled:opacity-80 sm:h-48 cursor-pointer"
                  >
                    <img
                      src={editBannerUrl || "/galaxy-banner.png"}
                      alt="Vista previa de portada"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-brand-navy/20 to-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                        {isUploadingEditBanner ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Camera size={16} className="text-brand-cyan" />
                        )}
                        Cambiar portada
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => editAvatarInputRef.current?.click()}
                    disabled={isUploadingEditAvatar || isSavingProfile}
                    className="group absolute -bottom-10 left-5 grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-white text-3xl font-black text-white shadow-2xl shadow-brand-blue/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80 dark:border-[#0E1B2F] dark:bg-[#0E1B2F] cursor-pointer"
                  >
                    {editPhotoUrl ? (
                      <img
                        src={editPhotoUrl}
                        alt="Vista previa de foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-blue to-brand-cyan">
                        {editPreviewInitial}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />
                    <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur">
                      {isUploadingEditAvatar ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Camera size={15} />
                      )}
                    </span>
                  </button>

                  <input
                    ref={editBannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={isUploadingEditBanner || isSavingProfile}
                    onChange={(e) => handleEditImageChange(e, "BANNER")}
                  />
                  <input
                    ref={editAvatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={isUploadingEditAvatar || isSavingProfile}
                    onChange={(e) => handleEditImageChange(e, "AVATAR")}
                  />
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                      Nombre de usuario
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm font-semibold outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Min. 3 caracteres. Solo minúsculas, números y guiones bajos (_).
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Descripción
                  </label>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Cuenta qué estás preparando, qué te gusta estudiar o qué tipo de compañeros quieres encontrar.
                  </p>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={240}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                  />
                  <div className="text-right text-[10px] text-slate-400">
                    {editBio.length}/240
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Universidad objetivo
                  </label>
                  <input
                    type="text"
                    value={editTargetUniversity}
                    onChange={(e) => setEditTargetUniversity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-brand-navy/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile || isUploadingEditAvatar || isUploadingEditBanner}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-brand-navy/20 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || isUploadingEditAvatar || isUploadingEditBanner}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan py-3 text-xs font-black uppercase tracking-wider text-white hover:brightness-105 shadow-md shadow-brand-blue/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Lightbox for Friend */}
      {selectedFriend && (() => {
        const friend = selectedFriend;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm scale-100 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-brand-cyan/15 dark:bg-[#0E1B2F] animate-in zoom-in-95 duration-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy/30 cursor-pointer animate-pulse"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center mt-2 space-y-4 text-center">
                {friend.photoUrl ? (
                  <img
                    src={friend.photoUrl}
                    alt={friend.displayName || "Amigo"}
                    className="h-20 w-20 rounded-3xl object-cover border border-slate-100 dark:border-brand-navy/30 shadow-xl"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-blue to-brand-cyan text-white text-3xl font-black uppercase shadow-xl">
                    {(friend.username || friend.displayName || "?").charAt(0)}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 justify-center">
                    <h3 className="text-xl font-black text-brand-navy dark:text-white">
                      {friend.displayName || friend.username || "Usuario"}
                    </h3>
                    <span className="rounded-full bg-brand-sky dark:bg-brand-blue/15 px-2 py-0.5 text-[10px] font-black text-brand-blue dark:text-brand-cyan shrink-0">
                      Lv. {friend.level}
                    </span>
                  </div>
                  {friend.username && (
                    <p className="text-xs font-bold text-slate-400">
                      @{friend.username}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-brand-navy/20 w-full pt-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {friend.bio || "Este estudiante aún no ha agregado una descripción a su perfil."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}



interface AchievementSectionProps {
  title: string;
  description: string;
  achievements: AchievementsResponse["data"];
  isLoading: boolean;
  isError: boolean;
  errorText?: string;
  emptyText: string;
}

function AchievementSection({
  title,
  description,
  achievements,
  isLoading,
  isError,
  errorText,
  emptyText
}: AchievementSectionProps) {
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);
  const lockedAchievements = achievements.filter((achievement) => !achievement.unlocked);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] space-y-4">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
              <Trophy size={18} />
              <h2 className="text-xl font-black text-brand-navy dark:text-white">{title}</h2>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <div className="rounded-2xl border border-brand-cyan/20 bg-brand-sky px-3 py-2 text-center dark:bg-brand-blue/10">
            <p className="text-lg font-black text-brand-blue dark:text-brand-cyan">{unlockedAchievements.length}</p>
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">ganadas</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-cyan" />
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">Cargando medallas...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <Sparkles className="mx-auto h-6 w-6 text-red-400" />
          <p className="mt-2 text-xs font-bold text-red-500">
            {errorText || "No se pudieron cargar tus medallas."}
          </p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
          <Sparkles className="mx-auto h-6 w-6 text-brand-cyan" />
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement) => (
            <AchievementMedalItem key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementMedalItem({ achievement }: { achievement: AchievementsResponse["data"][number] }) {
  const isLocked = !achievement.unlocked;
  const isSecret = achievement.code.startsWith("SECRET_");
  const displayTitle = isSecret && isLocked ? "Logro Secreto" : achievement.title;
  const displayDescription = isSecret && isLocked
    ? "Sigue estudiando para descubrir este secreto."
    : achievement.description;

  return (
    <div
      className="group relative flex min-h-20 cursor-pointer items-center justify-center p-2 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-none"
      tabIndex={0}
      aria-label={`${displayTitle}. ${isLocked ? "Bloqueada" : "Ganada"}. ${achievement.experienceReward} XP.`}
    >
      <AchievementMedal code={achievement.code} locked={isLocked} size="md" />

      <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-3 w-64 -translate-x-1/2 translate-y-2 scale-95 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-white opacity-0 shadow-2xl shadow-slate-950/25 transition-all duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 dark:border-brand-cyan/20 dark:bg-[#07111F]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-brand-cyan">{displayTitle}</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-300">
              {displayDescription}
            </p>
          </div>
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${
            isLocked
              ? "border-slate-700 bg-slate-800 text-slate-500"
              : "border-brand-cyan/35 bg-brand-cyan/15 text-brand-cyan shadow-[0_0_18px_rgba(34,211,238,0.25)]"
          }`}>
            {isLocked ? <Lock size={15} /> : <Trophy size={15} />}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px]">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
            isLocked
              ? "bg-slate-800 text-slate-400"
              : "bg-brand-cyan/15 text-brand-cyan"
          }`}>
            {isLocked ? <Lock size={10} /> : <Trophy size={10} />}
            {isLocked ? "Bloqueada" : "Ganada"}
          </span>
          <span className="font-black text-brand-yellow">
            +{achievement.experienceReward} XP
          </span>
        </div>
        <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 border-b border-r border-slate-800 bg-slate-950 dark:border-brand-cyan/20 dark:bg-[#07111F]" />
      </div>
    </div>
  );
}
