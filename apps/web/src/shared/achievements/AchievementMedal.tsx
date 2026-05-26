import type { AchievementCode } from "./types";

interface AchievementMedalProps {
  code: AchievementCode;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24"
};

const illustrationScaleClasses = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-16 w-16"
};

const medalThemes: Record<AchievementCode, { from: string; via: string; to: string; ring: string }> = {
  PROFILE_80: {
    from: "#22D3EE",
    via: "#0879F2",
    to: "#7C3AED",
    ring: "#67E8F9"
  },
  FIRST_EXAM_COMPLETED: {
    from: "#FACC15",
    via: "#F97316",
    to: "#EF4444",
    ring: "#FDE68A"
  },
  FIRST_EXAM_CREATED: {
    from: "#A78BFA",
    via: "#6366F1",
    to: "#0EA5E9",
    ring: "#C4B5FD"
  },
  FIRST_STREAK_DAY: {
    from: "#FB7185",
    via: "#F97316",
    to: "#FACC15",
    ring: "#FDBA74"
  },
  STREAK_7_DAYS: {
    from: "#FDE047",
    via: "#22C55E",
    to: "#14B8A6",
    ring: "#BEF264"
  },
  FIRST_ANSWER: {
    from: "#38BDF8",
    via: "#2563EB",
    to: "#1E3A8A",
    ring: "#BAE6FD"
  },
  FIRST_COMMUNITY_POST: {
    from: "#F472B6",
    via: "#A855F7",
    to: "#2563EB",
    ring: "#FBCFE8"
  },
  FIRST_CONNECTION: {
    from: "#2DD4BF",
    via: "#06B6D4",
    to: "#2563EB",
    ring: "#99F6E4"
  }
};

export function AchievementMedal({ code, locked = false, size = "md" }: AchievementMedalProps) {
  const theme = medalThemes[code];

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${sizeClasses[size]} ${
        locked ? "grayscale opacity-45" : "shadow-lg shadow-brand-blue/20"
      }`}
      style={{
        background: `conic-gradient(from 210deg, ${theme.ring}, ${theme.from}, ${theme.via}, ${theme.to}, ${theme.ring})`
      }}
    >
      <div className="absolute inset-[4px] rounded-full bg-white/85 dark:bg-[#07111F]/90" />
      <div
        className="absolute inset-[8px] rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), ${theme.from} 20%, ${theme.via} 58%, ${theme.to})`
        }}
      />
      <div className="absolute left-[18%] top-[15%] h-[18%] w-[18%] rounded-full bg-white/80 blur-[1px]" />
      <div className="absolute bottom-[12%] right-[13%] h-[14%] w-[14%] rounded-full bg-white/25 blur-[2px]" />
      <div className={`relative drop-shadow-[0_6px_10px_rgba(6,38,95,0.35)] ${illustrationScaleClasses[size]}`}>
        <MedalIllustration code={code} />
      </div>
    </div>
  );
}

function MedalIllustration({ code }: { code: AchievementCode }) {
  switch (code) {
    case "PROFILE_80":
      return <ProfileMedalSvg />;
    case "FIRST_EXAM_COMPLETED":
      return <CompletedExamMedalSvg />;
    case "FIRST_EXAM_CREATED":
      return <CreatedExamMedalSvg />;
    case "FIRST_STREAK_DAY":
      return <FirstStreakMedalSvg />;
    case "STREAK_7_DAYS":
      return <SevenDayStreakMedalSvg />;
    case "FIRST_ANSWER":
      return <FirstAnswerMedalSvg />;
    case "FIRST_COMMUNITY_POST":
      return <CommunityPostMedalSvg />;
    case "FIRST_CONNECTION":
      return <ConnectionMedalSvg />;
  }
}

function SvgShell({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function Spark({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <path
      d={`M ${x} ${y - 6 * size} L ${x + 2 * size} ${y - 2 * size} L ${x + 6 * size} ${y} L ${x + 2 * size} ${y + 2 * size} L ${x} ${y + 6 * size} L ${x - 2 * size} ${y + 2 * size} L ${x - 6 * size} ${y} L ${x - 2 * size} ${y - 2 * size} Z`}
      fill="white"
      opacity="0.92"
    />
  );
}

function ProfileMedalSvg() {
  return (
    <SvgShell>
      <Spark x={49} y={14} size={0.75} />
      <path d="M18 50c2.3-9.4 8.2-13.7 14-13.7S43.7 40.6 46 50" fill="#FFFFFF" opacity="0.92" />
      <circle cx="32" cy="25" r="9.5" fill="#E8F7FF" />
      <path d="M17 51h30" stroke="#06265F" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <path d="M14 31a18 18 0 0 1 36-1" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M49 30a18 18 0 0 1-5 12" fill="none" stroke="#33D6D0" strokeWidth="5" strokeLinecap="round" />
      <path d="M43 24l4 4 8-10" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </SvgShell>
  );
}

function CompletedExamMedalSvg() {
  return (
    <SvgShell>
      <path d="M20 9h22l7 8v36H20z" fill="#FFFFFF" />
      <path d="M42 9v10h9" fill="#BEEBFF" />
      <path d="M26 25h17M26 32h11M26 39h9" stroke="#06265F" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
      <circle cx="43" cy="42" r="13" fill="#16A34A" />
      <path d="M36 42l5 5 10-12" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Spark x={18} y={17} size={0.55} />
    </SvgShell>
  );
}

function CreatedExamMedalSvg() {
  return (
    <SvgShell>
      <path d="M18 14h28c3 0 5 2 5 5v31H18z" fill="#FFFFFF" />
      <path d="M18 14c0 4 3 6 7 6h26" fill="none" stroke="#E0E7FF" strokeWidth="8" strokeLinecap="round" />
      <path d="M25 29h19M25 37h13" stroke="#06265F" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M18 50h33" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
      <path d="M38 46l14-24 5 5-24 14-5 10z" fill="#33D6D0" />
      <path d="M52 22l5 5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="33" cy="41" r="2.5" fill="#06265F" opacity="0.75" />
    </SvgShell>
  );
}

function FirstStreakMedalSvg() {
  return (
    <SvgShell>
      <path d="M33 55c-11 0-18-7-18-17 0-8 5-13 10-17 1 7 5 9 5 9 0-11 8-17 8-17 2 9 11 13 11 24 0 10-6 18-16 18z" fill="#FFFFFF" />
      <path d="M34 51c-6 0-10-4-10-10 0-5 3-8 6-11 1 5 4 6 4 6 0-7 5-11 5-11 1 6 7 9 7 16 0 6-5 10-12 10z" fill="#F97316" />
      <path d="M14 16h13v13H14z" fill="#E8F7FF" />
      <path d="M17 20h7M17 25h4" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <Spark x={49} y={16} size={0.65} />
    </SvgShell>
  );
}

function SevenDayStreakMedalSvg() {
  return (
    <SvgShell>
      <path d="M33 57c-12 0-20-7-20-18 0-9 6-14 11-19 1 8 6 10 6 10 0-12 9-19 9-19 2 10 12 15 12 27 0 11-7 19-18 19z" fill="#FFFFFF" />
      <path d="M33 52c-7 0-12-4-12-11 0-6 4-9 7-13 1 6 5 7 5 7 0-8 6-13 6-13 1 7 8 10 8 18 0 7-5 12-14 12z" fill="#22C55E" />
      <path d="M24 12l8-5 8 5-2 9H26z" fill="#FDE047" />
      <text x="32" y="45" textAnchor="middle" fontSize="18" fontWeight="900" fill="#06265F">7</text>
      <Spark x={50} y={17} size={0.55} />
    </SvgShell>
  );
}

function FirstAnswerMedalSvg() {
  return (
    <SvgShell>
      <path d="M14 16h36c3 0 5 2 5 5v18c0 3-2 5-5 5H34l-12 9 3-9H14c-3 0-5-2-5-5V21c0-3 2-5 5-5z" fill="#FFFFFF" />
      <path d="M20 28h22M20 35h13" stroke="#06265F" strokeWidth="3" strokeLinecap="round" opacity="0.48" />
      <path d="M39 42l13-13 5 5-13 13-7 2z" fill="#33D6D0" />
      <circle cx="48" cy="17" r="5" fill="#FACC15" />
      <path d="M47 14h2v5h-2zM47 21h2v2h-2z" fill="#06265F" opacity="0.75" />
    </SvgShell>
  );
}

function CommunityPostMedalSvg() {
  return (
    <SvgShell>
      <rect x="14" y="13" width="36" height="39" rx="8" fill="#FFFFFF" />
      <circle cx="24" cy="25" r="5" fill="#F472B6" />
      <path d="M33 22h10M33 28h7M21 38h22M21 44h15" stroke="#06265F" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
      <path d="M51 18c5 3 7 8 5 14M12 18c-5 3-7 8-5 14" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.82" />
      <Spark x={47} y={46} size={0.6} />
    </SvgShell>
  );
}

function ConnectionMedalSvg() {
  return (
    <SvgShell>
      <path d="M19 33h26" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
      <path d="M21 31l10-12M43 31L33 19M21 33l10 12M43 33L33 45" stroke="#E8F7FF" strokeWidth="4" strokeLinecap="round" opacity="0.86" />
      <circle cx="20" cy="32" r="10" fill="#FFFFFF" />
      <circle cx="44" cy="32" r="10" fill="#FFFFFF" />
      <circle cx="32" cy="18" r="8" fill="#33D6D0" />
      <circle cx="32" cy="46" r="8" fill="#0879F2" />
      <circle cx="20" cy="32" r="4" fill="#06265F" opacity="0.55" />
      <circle cx="44" cy="32" r="4" fill="#06265F" opacity="0.55" />
      <Spark x={32} y={32} size={0.7} />
    </SvgShell>
  );
}
