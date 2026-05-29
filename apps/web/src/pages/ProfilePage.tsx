import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Medal, Sparkles, Trophy, Camera, Loader2 } from "lucide-react";
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

  const achievementsQuery = useQuery<AchievementsResponse, Error>({
    queryKey: ["achievements-me"],
    queryFn: () => apiService.get<AchievementsResponse>("/achievements/me")
  });

  const rawAchievements = achievementsQuery.data?.data ?? [];
  const unlockedAchievements = rawAchievements.filter((achievement) => achievement.unlocked);
  const lockedAchievements = rawAchievements.filter((achievement) => !achievement.unlocked);
  const totalXp = unlockedAchievements.reduce(
    (total, achievement) => total + achievement.experienceReward,
    0
  );

  const achievements = [...rawAchievements].sort((a, b) => {
    // 1. Unlocked first
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;

    // 2. Secrets go at the bottom
    const aIsSecret = a.code.startsWith("SECRET_");
    const bIsSecret = b.code.startsWith("SECRET_");

    if (a.unlocked) {
      // Both unlocked: sort by experience reward ascending (easiest to hardest)
      if (a.experienceReward !== b.experienceReward) {
        return a.experienceReward - b.experienceReward;
      }
      return a.title.localeCompare(b.title);
    } else {
      // Both locked
      // Locked secrets go to the absolute bottom
      if (aIsSecret && !bIsSecret) return 1;
      if (!aIsSecret && bIsSecret) return -1;

      // Within locked groups: sort by experience reward ascending (easiest to hardest)
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

      // Actualizar el estado local inmediatamente sin esperar a /auth/me (evita problemas de caché de navegador)
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
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">
                  Perfil ExamInA
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight">
                  {user?.profile?.username || user?.displayName || "Estudiante"}
                </h1>
                <p className="mt-1 max-w-xl text-sm font-semibold text-white/80">
                  {user?.profile?.bio || "Tu vitrina de progreso, rachas y medallas desbloqueadas."}
                </p>
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

      {achievementsQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-400 dark:border-brand-navy/30 dark:bg-[#0E1B2F]">
          Cargando medallas...
        </div>
      ) : achievementsQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-500 dark:border-red-900/40 dark:bg-red-950/20">
          No se pudieron cargar tus medallas.
        </div>
      ) : (
        <AchievementSection
          title="Tus Medallas"
          description="Visualiza tu progreso, medallas desbloqueadas y retos pendientes."
          achievements={achievements}
          emptyText="No se encontraron medallas."
        />
      )}
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
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-brand-blue dark:text-brand-cyan">
          <Trophy size={18} />
          <h2 className="text-xl font-black text-brand-navy dark:text-white">{title}</h2>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-brand-navy/40 dark:bg-[#0E1B2F]/70">
          <Sparkles className="mx-auto h-8 w-8 text-brand-cyan" />
          <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const isLocked = !achievement.unlocked;
            const isSecret = achievement.code.startsWith("SECRET_");
            const displayTitle = isSecret && isLocked ? "🔒 Logro Secreto" : achievement.title;
            const displayDescription = isSecret && isLocked ? "?? (Sigue estudiando para descubrir este secreto...)" : achievement.description;

            return (
              <article
                key={achievement.id}
                className={`rounded-3xl border bg-white p-5 shadow-lg shadow-brand-blue/5 transition dark:bg-[#0E1B2F] ${
                  isLocked
                    ? "border-slate-200 opacity-75 dark:border-brand-navy/25"
                    : "border-brand-blue/15 hover:-translate-y-1 hover:shadow-brand-blue/15 dark:border-brand-cyan/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <AchievementMedal code={achievement.code} locked={isLocked} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Medal size={15} className={isLocked ? "text-slate-400" : "text-brand-blue dark:text-brand-cyan"} />
                      <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {isLocked ? "Bloqueada" : "Desbloqueada"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-black text-brand-navy dark:text-white truncate">
                      {displayTitle}
                    </h3>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400 min-h-[32px]">
                      {displayDescription}
                    </p>
                    <div className="mt-4 inline-flex rounded-full bg-brand-sky px-3 py-1 text-[11px] font-black text-brand-blue dark:bg-brand-blue/15 dark:text-brand-cyan">
                      +{achievement.experienceReward} XP
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}