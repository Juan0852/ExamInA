import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Code2, X, ChevronDown, Trophy, Sparkles } from "lucide-react";
import { apiService } from "../services/api.service";
import { useAchievementToasts } from "../achievements/achievement-toast.store";
import type { Achievement, AchievementCode, AchievementsResponse } from "../achievements/types";

/** Boolean de habilitación — ponlo en false para ocultarlo en producción */
const DEV_PANEL_ENABLED = import.meta.env.DEV;

const DEBUG_ACHIEVEMENTS: Achievement[] = [
  {
    id: "debug-profile-80",
    code: "PROFILE_80",
    title: "Perfil brillante",
    description: "Completa nombre, descripcion e imagen de perfil.",
    icon: "profile-80",
    experienceReward: 120,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-exam-completed",
    code: "FIRST_EXAM_COMPLETED",
    title: "Primer examen cerrado",
    description: "Completa tu primer examen en ExamInA.",
    icon: "first-exam-completed",
    experienceReward: 180,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-exam-created",
    code: "FIRST_EXAM_CREATED",
    title: "Creador de retos",
    description: "Crea tu primer examen para estudiar o compartir.",
    icon: "first-exam-created",
    experienceReward: 160,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-streak-day",
    code: "FIRST_STREAK_DAY",
    title: "Chispa inicial",
    description: "Consigue tu primer dia de racha de estudio.",
    icon: "first-streak-day",
    experienceReward: 80,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-streak-7-days",
    code: "STREAK_7_DAYS",
    title: "Semana imparable",
    description: "Mantén una racha de estudio de 7 dias.",
    icon: "streak-7-days",
    experienceReward: 260,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-answer",
    code: "FIRST_ANSWER",
    title: "Primera respuesta",
    description: "Responde tu primera pregunta de practica.",
    icon: "first-answer",
    experienceReward: 90,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-community-post",
    code: "FIRST_COMMUNITY_POST",
    title: "Voz en la comunidad",
    description: "Publica por primera vez en la comunidad.",
    icon: "first-community-post",
    experienceReward: 140,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  },
  {
    id: "debug-first-connection",
    code: "FIRST_CONNECTION",
    title: "Primera conexion",
    description: "Conecta con tu primer companero de estudio.",
    icon: "first-connection",
    experienceReward: 130,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  }
];

/**
 * DevPanel: Caja flotante de herramientas de desarrollo.
 * Se superpone a cualquier otro elemento mediante posición fija con z-index alto.
 * Puede activarse/desactivarse con la constante DEV_PANEL_ENABLED.
 */
export function DevPanel() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAchievementCode, setSelectedAchievementCode] = useState<AchievementCode>("PROFILE_80");
  const [isEvaluatingAchievements, setIsEvaluatingAchievements] = useState(false);
  const pushAchievementToasts = useAchievementToasts();

  if (!DEV_PANEL_ENABLED) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-1">
      {/* Panel expandido */}
      {isOpen && (
        <div className="bg-white dark:bg-[#0E1B2F] border border-amber-400/60 dark:border-amber-500/40 rounded-2xl shadow-2xl p-4 w-72 mb-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <Code2 size={12} />
              Dev Tools
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/onboarding");
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
          >
            <PlayCircle size={14} />
            Ir a Onboarding
          </button>

          <div className="my-4 h-px bg-amber-200/70 dark:bg-amber-500/20" />

          <div className="space-y-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">
                <Trophy size={12} />
                Debug logros
              </span>
              <select
                value={selectedAchievementCode}
                onChange={(event) => setSelectedAchievementCode(event.target.value as AchievementCode)}
                className="w-full rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 outline-none dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
              >
                {DEBUG_ACHIEVEMENTS.map((achievement) => (
                  <option key={achievement.code} value={achievement.code}>
                    {achievement.title}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                const achievement = DEBUG_ACHIEVEMENTS.find(
                  (debugAchievement) => debugAchievement.code === selectedAchievementCode
                );

                if (achievement) {
                  pushAchievementToasts([
                    {
                      ...achievement,
                      id: `${achievement.id}-${Date.now()}`
                    }
                  ]);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              Lanzar toast debug
            </button>

            <button
              type="button"
              onClick={() => {
                pushAchievementToasts(
                  DEBUG_ACHIEVEMENTS.slice(0, 3).map((achievement, index) => ({
                    ...achievement,
                    id: `${achievement.id}-queue-${Date.now()}-${index}`
                  }))
                );
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              Probar cola x3
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsEvaluatingAchievements(true);

                try {
                  const response = await apiService.post<AchievementsResponse>("/achievements/me/evaluate");
                  pushAchievementToasts(response.meta.newlyUnlockedAchievements ?? []);
                } finally {
                  setIsEvaluatingAchievements(false);
                }
              }}
              disabled={isEvaluatingAchievements}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trophy size={14} />
              {isEvaluatingAchievements ? "Evaluando..." : "Evaluar logros reales"}
            </button>
          </div>
        </div>
      )}

      {/* Botón toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border border-amber-400/60 dark:border-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 shadow-lg transition-all cursor-pointer"
      >
        <Code2 size={12} />
        Dev
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
