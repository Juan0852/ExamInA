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
  },
  CONNECTION_10: {
    from: "#10B981",
    via: "#059669",
    to: "#047857",
    ring: "#A7F3D0"
  },
  EXAMS_10: {
    from: "#FB923C",
    via: "#F97316",
    to: "#EA580C",
    ring: "#FFEDD5"
  },
  EXAMS_50: {
    from: "#94A3B8",
    via: "#64748B",
    to: "#475569",
    ring: "#E2E8F0"
  },
  EXAMS_100: {
    from: "#FBBF24",
    via: "#F59E0B",
    to: "#D97706",
    ring: "#FEF3C7"
  },
  EXAMS_CREATED_10: {
    from: "#EC4899",
    via: "#DB2777",
    to: "#9D174D",
    ring: "#FCE7F3"
  },
  STUDY_1_HOUR: {
    from: "#6EE7B7",
    via: "#10B981",
    to: "#047857",
    ring: "#D1FAE5"
  },
  STUDY_10_HOURS: {
    from: "#60A5FA",
    via: "#3B82F6",
    to: "#1D4ED8",
    ring: "#DBEAFE"
  },
  STUDY_50_HOURS: {
    from: "#C084FC",
    via: "#A855F7",
    to: "#7E22CE",
    ring: "#F3E8FF"
  },
  PERFECT_EXAM: {
    from: "#F472B6",
    via: "#EC4899",
    to: "#E11D48",
    ring: "#FFE4E6"
  },
  PERFECT_ANSWER: {
    from: "#34D399",
    via: "#059669",
    to: "#064E3B",
    ring: "#D1FAE5"
  },
  GREAT_ANSWER: {
    from: "#60A5FA",
    via: "#2563EB",
    to: "#1E40AF",
    ring: "#DBEAFE"
  },
  SECRET_NIGHT_OWL: {
    from: "#312E81",
    via: "#1E1B4B",
    to: "#0F172A",
    ring: "#818CF8"
  },
  SECRET_SUNDAY_STUDY: {
    from: "#FDBA74",
    via: "#F97316",
    to: "#C2410C",
    ring: "#FEF3C7"
  },
  SECRET_PERFECTIONIST: {
    from: "#F87171",
    via: "#EF4444",
    to: "#B91C1C",
    ring: "#FEE2E2"
  }
};

export function AchievementMedal({ code, locked = false, size = "md" }: AchievementMedalProps) {
  const theme = medalThemes[code] || medalThemes.FIRST_ANSWER;

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
    case "CONNECTION_10":
      return <Connection10MedalSvg />;
    case "EXAMS_10":
      return <Exams10MedalSvg />;
    case "EXAMS_50":
      return <Exams50MedalSvg />;
    case "EXAMS_100":
      return <Exams100MedalSvg />;
    case "EXAMS_CREATED_10":
      return <ExamsCreated10MedalSvg />;
    case "STUDY_1_HOUR":
      return <Study1HourMedalSvg />;
    case "STUDY_10_HOURS":
      return <Study10HoursMedalSvg />;
    case "STUDY_50_HOURS":
      return <Study50HoursMedalSvg />;
    case "PERFECT_EXAM":
      return <PerfectExamMedalSvg />;
    case "PERFECT_ANSWER":
      return <PerfectAnswerMedalSvg />;
    case "GREAT_ANSWER":
      return <GreatAnswerMedalSvg />;
    case "SECRET_NIGHT_OWL":
      return <SecretNightOwlMedalSvg />;
    case "SECRET_SUNDAY_STUDY":
      return <SecretSundayStudyMedalSvg />;
    case "SECRET_PERFECTIONIST":
      return <SecretPerfectionistMedalSvg />;
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

function Connection10MedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="16" fill="#10B981" />
      <circle cx="32" cy="18" r="6" fill="#FFFFFF" />
      <circle cx="18" cy="38" r="6" fill="#FFFFFF" />
      <circle cx="46" cy="38" r="6" fill="#FFFFFF" />
      <path d="M32 18l-14 20M32 18l14 20M18 38h28" stroke="#FFFFFF" strokeWidth="2.5" />
      <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="950" fill="#06265F">10</text>
    </SvgShell>
  );
}

function Exams10MedalSvg() {
  return (
    <SvgShell>
      <rect x="18" y="14" width="28" height="36" rx="4" fill="#FFFFFF" />
      <path d="M24 24h16M24 30h16M24 36h10" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <circle cx="32" cy="42" r="11" fill="#EA580C" />
      <text x="32" y="47" textAnchor="middle" fontSize="12" fontWeight="950" fill="#FFFFFF">10</text>
    </SvgShell>
  );
}

function Exams50MedalSvg() {
  return (
    <SvgShell>
      <rect x="18" y="14" width="28" height="36" rx="4" fill="#FFFFFF" />
      <path d="M24 24h16M24 30h16M24 36h10" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <circle cx="32" cy="42" r="11" fill="#475569" />
      <text x="32" y="47" textAnchor="middle" fontSize="12" fontWeight="950" fill="#FFFFFF">50</text>
    </SvgShell>
  );
}

function Exams100MedalSvg() {
  return (
    <SvgShell>
      <rect x="18" y="14" width="28" height="36" rx="4" fill="#FFFFFF" />
      <path d="M24 24h16M24 30h16M24 36h10" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <circle cx="32" cy="42" r="12" fill="#D97706" />
      <text x="32" y="46" textAnchor="middle" fontSize="9" fontWeight="950" fill="#FFFFFF">100</text>
    </SvgShell>
  );
}

function ExamsCreated10MedalSvg() {
  return (
    <SvgShell>
      <path d="M16 16h24l8 8v24H16z" fill="#FFFFFF" />
      <path d="M22 28h20M22 34h12" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="44" cy="44" r="10" fill="#EC4899" />
      <path d="M41 44h6M44 41v6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <text x="32" y="22" textAnchor="middle" fontSize="8" fontWeight="950" fill="#06265F">10</text>
    </SvgShell>
  );
}

function Study1HourMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <path d="M32 18v14l8 4" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="47" textAnchor="middle" fontSize="12" fontWeight="950" fill="#06265F">1h</text>
    </SvgShell>
  );
}

// Fixed study 10 hours spelling in SVG name to match MedallIllustration
function Study10HoursMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <path d="M32 18v14l8 4" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="47" textAnchor="middle" fontSize="11" fontWeight="950" fill="#06265F">10h</text>
    </SvgShell>
  );
}

function Study50HoursMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <path d="M32 18v14l8 4" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="47" textAnchor="middle" fontSize="11" fontWeight="950" fill="#06265F">50h</text>
    </SvgShell>
  );
}

function PerfectExamMedalSvg() {
  return (
    <SvgShell>
      <path d="M32 12l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill="#FFFFFF" />
      <circle cx="32" cy="31" r="7" fill="#E11D48" />
      <text x="32" y="35" textAnchor="middle" fontSize="11" fontWeight="950" fill="#FFFFFF">10</text>
    </SvgShell>
  );
}

function PerfectAnswerMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="12" fill="#059669" />
      <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="950" fill="#FFFFFF">10</text>
      <Spark x={18} y={18} size={0.5} />
    </SvgShell>
  );
}

// GreatAnswerMedalSvg matching switch block in MedallIllustration
function GreatAnswerMedalSvg() {
  return (
    <SvgShell>
      <path d="M32 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#FFFFFF" />
      <text x="32" y="41" textAnchor="middle" fontSize="10" fontWeight="950" fill="#2563EB">7.5</text>
    </SvgShell>
  );
}

function SecretNightOwlMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#0F172A" />
      <circle cx="24" cy="30" r="5" fill="#FFFFFF" />
      <circle cx="40" cy="30" r="5" fill="#FFFFFF" />
      <circle cx="24" cy="30" r="2.5" fill="#1D4ED8" />
      <circle cx="40" cy="30" r="2.5" fill="#1D4ED8" />
      <path d="M28 38s4 3 8 0" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 20a16 16 0 0 1 12-6" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </SvgShell>
  );
}

function SecretSundayStudyMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFBEB" />
      <circle cx="32" cy="24" r="10" fill="#F97316" />
      <rect x="20" y="36" width="24" height="12" rx="2" fill="#FFFFFF" stroke="#06265F" strokeWidth="2.5" />
      <path d="M26 42h12" stroke="#06265F" strokeWidth="2" strokeLinecap="round" />
      <Spark x={48} y={16} size={0.5} />
    </SvgShell>
  );
}

function SecretPerfectionistMedalSvg() {
  return (
    <SvgShell>
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#EF4444" strokeWidth="2" />
      <circle cx="32" cy="32" r="8" fill="none" stroke="#EF4444" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="3" fill="#EF4444" />
      <path d="M20 44l8-8m10-10l6-6" stroke="#06265F" strokeWidth="2.5" strokeLinecap="round" />
      <text x="32" y="27" textAnchor="middle" fontSize="7" fontWeight="950" fill="#06265F">MAT</text>
    </SvgShell>
  );
}
