import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AchievementMedal, medalThemes } from "../../achievements/AchievementMedal";
import { useAchievementToastStore } from "../../achievements/achievement-toast.store";

const TOAST_DURATION_MS = 3000;
const TOAST_EXIT_MS = 560;

const particleVectors = [
  [-360, -130, 620, 18, 8],
  [-300, 92, -560, 10, 20],
  [-230, -196, 720, 24, 9],
  [-180, 188, -640, 10, 24],
  [-104, -260, 580, 16, 10],
  [-34, 250, -700, 26, 10],
  [42, -250, 620, 10, 26],
  [122, 232, -600, 18, 10],
  [214, -164, 680, 26, 9],
  [312, 128, -560, 12, 24],
  [-392, 2, 520, 16, 9],
  [398, -82, -700, 22, 10],
  [-8, -320, 680, 11, 26],
  [16, 298, -620, 26, 9],
  [-254, -36, 580, 9, 22],
  [256, 36, -560, 22, 9],
  [-196, 254, 620, 12, 22],
  [198, -264, -660, 24, 9],
  [-410, -190, 740, 12, 30],
  [420, 182, -760, 30, 10],
  [-342, 238, 660, 18, 16],
  [348, -230, -720, 16, 20],
  [-82, -350, 620, 9, 28],
  [94, 332, -660, 28, 9]
];

export function AchievementToastHost() {
  const queue = useAchievementToastStore((state) => state.queue);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-3 px-4 sm:top-6">
      <AnimatePresence initial={false}>
        {queue.map((achievement) => (
          <AchievementToast key={achievement.id} achievementId={achievement.id} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AchievementToast({ achievementId }: { achievementId: string }) {
  const [isExiting, setIsExiting] = useState(false);
  const achievement = useAchievementToastStore((state) =>
    state.queue.find((queuedAchievement) => queuedAchievement.id === achievementId)
  );
  const dismissAchievement = useAchievementToastStore((state) => state.dismissAchievement);

  useEffect(() => {
    const exitTimeout = window.setTimeout(
      () => setIsExiting(true),
      Math.max(0, TOAST_DURATION_MS - TOAST_EXIT_MS)
    );
    const dismissTimeout = window.setTimeout(
      () => dismissAchievement(achievementId),
      TOAST_DURATION_MS
    );

    return () => {
      window.clearTimeout(exitTimeout);
      window.clearTimeout(dismissTimeout);
    };
  }, [achievementId, dismissAchievement]);

  if (!achievement) {
    return null;
  }

  const theme = medalThemes[achievement.code] || medalThemes.FIRST_ANSWER;
  const gradientId = `achievement-toast-progress-gradient-${achievement.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -38, scale: 0.92, filter: "blur(8px)" }}
      animate={
        isExiting
          ? { opacity: 1, y: -8, scale: 1.04, filter: "blur(0px)" }
          : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      }
      exit={{ opacity: 0, y: -86, scale: 0.18, rotate: -5, filter: "blur(18px)" }}
      transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.8 }}
      className="pointer-events-auto relative w-full max-w-md overflow-visible rounded-2xl"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {particleVectors.map(([x, y, rotate, width, height], index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.2, rotate: 0 }}
            animate={
              isExiting
                ? {
                    opacity: [0, 1, 0.92, 0],
                    x: `calc(-50% + ${x}px)`,
                    y: `calc(-50% + ${y}px)`,
                    scale: [0.2, 1.45, 1, 0.05],
                    rotate,
                  }
                : { opacity: 0, x: "-50%", y: "-50%", scale: 0.2, rotate: 0 }
            }
            transition={{
              duration: 0.5,
              ease: [0.12, 0.82, 0.22, 1],
              delay: isExiting ? index * 0.002 : 0
            }}
            className="absolute left-1/2 top-1/2 rounded-[4px] shadow-[0_0_12px_rgba(255,255,255,0.8)] will-change-transform"
            style={{
              width,
              height,
              background: `linear-gradient(135deg, #ffffff 0%, ${theme.from} 50%, ${theme.to} 100%)`
            }}
          />
        ))}
      </div>
      <motion.div
        animate={
          isExiting
            ? {
                opacity: [1, 1, 0],
                scale: [1, 1.08, 0.18],
                y: [0, -8, -62],
                rotate: [0, 1.2, -6]
              }
            : { opacity: 1, scale: 1, y: 0, rotate: 0 }
        }
        transition={{ duration: TOAST_EXIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:bg-[#0E1B2F]/95"
        style={{
          borderColor: theme.via,
          boxShadow: `0 20px 30px -4px ${theme.via}25, 0 4px 12px -2px ${theme.to}15`
        }}
      >
      <div className="flex items-center gap-3">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
            <circle
              cx="44"
              cy="44"
              r="39"
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="5"
            />
            <circle
              className="achievement-toast-progress"
              cx="44"
              cy="44"
              r="39"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              strokeWidth="5"
              strokeDasharray="245"
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={theme.from} />
                <stop offset="50%" stopColor={theme.via} />
                <stop offset="100%" stopColor={theme.to} />
              </linearGradient>
            </defs>
          </svg>
          <AchievementMedal code={achievement.code} size="md" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-black uppercase tracking-wide"
            style={{ color: theme.via }}
          >
            Logro desbloqueado
          </p>
          <h2 className="mt-0.5 truncate text-base font-black text-brand-navy dark:text-white">
            {achievement.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            {achievement.description}
          </p>
          <div
            className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black"
            style={{
              backgroundColor: `${theme.from}15`,
              color: theme.via
            }}
          >
            +{achievement.experienceReward} XP
          </div>
        </div>

        <button
          type="button"
          onClick={() => dismissAchievement(achievement.id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Cerrar logro"
        >
          <X size={16} />
        </button>
      </div>
      </motion.div>
    </motion.div>
  );
}
