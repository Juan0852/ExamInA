import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Medal, Sparkles, Trophy, Camera, Loader2, Edit, Users, MessageSquare, Heart, Lock, Globe, Shield } from "lucide-react";
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);



  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTargetUniversity, setEditTargetUniversity] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEditModal = () => {
    setEditDisplayName(user?.displayName || "");
    setEditUsername(user?.profile?.username || "");
    setEditBio(user?.profile?.bio || "");
    setEditTargetUniversity(user?.profile?.targetUniversity || "");
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
        targetUniversity: editTargetUniversity.trim() || ""
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
    queryFn: () => apiService.get<AchievementsResponse>("/achievements/me")
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("La imagen no puede superar 5 MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      const result = await fileUploadService.uploadImage(file, "AVATAR");

      await apiService.put("/auth/profile", {
        photoUrl: result.url
      });

      if (user) {
        setSession(token, { ...user, photoUrl: result.url });
      }

      await queryClient.invalidateQueries({ queryKey: ["achievements-me"] });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-brand-blue/10 bg-white shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F]">
        <div className="relative bg-gradient-to-r from-brand-blue via-brand-cyan to-fuchsia-500 px-6 py-10 text-white">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_24%),radial-gradient(circle_at_80%_10%,white_0,transparent_18%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <label className="group relative cursor-pointer">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName || "Perfil"}
                    className="h-20 w-20 rounded-3xl border-4 border-white/60 object-cover shadow-xl transition group-hover:brightness-90"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-3xl border-4 border-white/60 bg-white/20 text-3xl font-black shadow-xl transition group-hover:bg-white/30">
                    {(user?.profile?.username || user?.displayName || user?.email || "E").charAt(0).toUpperCase()}
                  </div>
                )}
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <Camera size={22} className="text-white drop-shadow-lg" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarChange}
                />
              </label>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  Perfil ExamInA
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <h1 className="text-3xl font-black tracking-tight">
                    {user?.displayName || user?.profile?.username || "Estudiante"}
                  </h1>
                  {user?.profile?.username && user?.displayName && (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-extrabold tracking-wide backdrop-blur">
                      @{user.profile.username}
                    </span>
                  )}
                  {user?.role && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur flex items-center gap-1 border ${
                      user.role === "ADMIN"
                        ? "bg-amber-500/25 text-amber-100 border-amber-400/30"
                        : user.role === "MODERATOR"
                        ? "bg-indigo-500/25 text-indigo-150 border-indigo-400/30"
                        : "bg-white/15 text-white/95 border-white/10"
                    }`}>
                      {user.role === "ADMIN" && <Sparkles size={10} className="text-amber-300" />}
                      {user.role === "MODERATOR" && <Shield size={10} className="text-indigo-300" />}
                      {user.role === "ADMIN" ? "Admin" : user.role === "MODERATOR" ? "Moderador" : "Estudiante"}
                    </span>
                  )}
                </div>

                <p className="mt-1 max-w-xl text-sm font-semibold text-white/80">
                  {user?.profile?.bio || "Tu vitrina de progreso, rachas y medallas desbloqueadas."}
                </p>
                {user?.profile?.targetUniversity && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-white/95">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                    Universidad objetivo: <span className="text-brand-cyan">{user.profile.targetUniversity}</span>
                  </p>
                )}
                <button
                  onClick={openEditModal}
                  className="mt-3.5 flex items-center gap-1.5 rounded-2xl bg-white/15 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/25 border border-white/10 hover:border-white/25 backdrop-blur transition cursor-pointer"
                >
                  <Edit size={13} className="text-brand-cyan" />
                  Editar Perfil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center sm:min-w-64">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-black">{unlockedAchievements.length}</p>
                <p className="text-[11px] font-bold uppercase text-white/75">Medallas</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-2xl font-black">{totalXp}</p>
                <p className="text-[11px] font-bold uppercase text-white/75">XP logros</p>
              </div>
            </div>
          </div>
        </div>

        {avatarError && (
          <div className="mx-6 mt-3 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 dark:bg-red-950/20 dark:text-red-400">
            {avatarError}
          </div>
        )}
      </section>

      {/* Unified Single-Screen Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Sidebar): Medallas & Amigos */}
        <div className="lg:col-span-1 space-y-6">
          <AchievementSection
            title="Medallas"
            description="Tu progreso y logros desbloqueados."
            achievements={achievements}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md scale-100 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-brand-cyan/15 dark:bg-[#0E1B2F] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-brand-navy/30">
              <h2 className="text-lg font-black text-brand-navy dark:text-white">
                Editar Perfil
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy/30"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {saveError && (
                <div className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-500 dark:bg-red-950/20 dark:text-red-400">
                  {saveError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Nombre de Usuario
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm font-semibold outline-none focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                    placeholder="nombre_de_usuario"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Min. 3 caracteres. Solo minúsculas, números y guiones bajos (_).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Universidad Objetivo
                </label>
                <input
                  type="text"
                  value={editTargetUniversity}
                  onChange={(e) => setEditTargetUniversity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan"
                  placeholder="Ej. UNAM, MIT, UBA..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Descripción (Bio)
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={240}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-blue focus:bg-white dark:border-brand-navy/30 dark:bg-brand-navy/20 dark:text-white dark:focus:border-brand-cyan resize-none"
                  placeholder="Cuéntanos un poco sobre ti..."
                />
                <div className="text-right text-[10px] text-slate-400">
                  {editBio.length}/240
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:border-brand-navy/30 dark:text-slate-400 dark:hover:bg-brand-navy/20 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
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
  emptyText: string;
}

function AchievementSection({
  title,
  description,
  achievements,
  emptyText
}: AchievementSectionProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-blue/5 dark:border-brand-cyan/15 dark:bg-[#0E1B2F] space-y-4">
      <div>
        <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
          <Trophy size={18} />
          <h2 className="text-xl font-black text-brand-navy dark:text-white">{title}</h2>
        </div>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
          <Sparkles className="mx-auto h-6 w-6 text-brand-cyan" />
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement) => {
            const isLocked = !achievement.unlocked;
            const isSecret = achievement.code.startsWith("SECRET_");
            const displayTitle = isSecret && isLocked ? "🔒 Logro Secreto" : achievement.title;
            const displayDescription = isSecret && isLocked ? "?? (Sigue estudiando para descubrir este secreto...)" : achievement.description;

            return (
              <div
                key={achievement.id}
                className="group relative flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <AchievementMedal code={achievement.code} locked={isLocked} size="md" />

                {/* Premium Hover Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-56 -translate-x-1/2 rounded-2xl bg-slate-950 p-3.5 text-left text-[11px] font-semibold text-white opacity-0 scale-95 translate-y-1 shadow-2xl transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 dark:bg-slate-900 border border-slate-850 dark:border-brand-navy/35 backdrop-blur-md">
                  <p className="font-black text-brand-cyan flex items-center gap-1">
                    <Medal size={11} className={isLocked ? "text-slate-400" : "text-brand-cyan"} />
                    {displayTitle}
                  </p>
                  <p className="mt-1 text-slate-300 font-semibold leading-relaxed">{displayDescription}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-800 dark:border-brand-navy/20 pt-2 text-[10px]">
                    <span className="font-extrabold text-slate-400 uppercase">
                      {isLocked ? "Bloqueada" : "Desbloqueada"}
                    </span>
                    <span className="font-black text-brand-yellow">
                      +{achievement.experienceReward} XP
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1.5 rotate-45 bg-slate-950 dark:bg-slate-900 border-r border-b border-slate-800 dark:border-brand-navy/35" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}