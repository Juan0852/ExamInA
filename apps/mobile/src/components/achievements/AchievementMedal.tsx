import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
  Text as SvgText
} from "react-native-svg";
import type { AchievementCode } from "../../achievements/types";

interface AchievementMedalProps {
  code: AchievementCode;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
}

type MedalTheme = {
  from: string;
  via: string;
  to: string;
  ring: string;
};

const medalSizes = {
  sm: { outer: 52, middle: 44, inner: 34 },
  md: { outer: 68, middle: 58, inner: 46 },
  lg: { outer: 96, middle: 82, inner: 66 }
};

export const medalThemes: Record<AchievementCode, MedalTheme> = {
  PROFILE_80: { from: "#22D3EE", via: "#0879F2", to: "#7C3AED", ring: "#67E8F9" },
  FIRST_EXAM_COMPLETED: { from: "#FACC15", via: "#F97316", to: "#EF4444", ring: "#FDE68A" },
  FIRST_EXAM_CREATED: { from: "#A78BFA", via: "#6366F1", to: "#0EA5E9", ring: "#C4B5FD" },
  FIRST_STREAK_DAY: { from: "#FB7185", via: "#F97316", to: "#FACC15", ring: "#FDBA74" },
  STREAK_7_DAYS: { from: "#FDE047", via: "#22C55E", to: "#14B8A6", ring: "#BEF264" },
  FIRST_ANSWER: { from: "#38BDF8", via: "#2563EB", to: "#1E3A8A", ring: "#BAE6FD" },
  FIRST_COMMUNITY_POST: { from: "#F472B6", via: "#A855F7", to: "#2563EB", ring: "#FBCFE8" },
  FIRST_CONNECTION: { from: "#2DD4BF", via: "#06B6D4", to: "#2563EB", ring: "#99F6E4" },
  CONNECTION_10: { from: "#10B981", via: "#059669", to: "#047857", ring: "#A7F3D0" },
  EXAMS_10: { from: "#FB923C", via: "#F97316", to: "#EA580C", ring: "#FFEDD5" },
  EXAMS_50: { from: "#94A3B8", via: "#64748B", to: "#475569", ring: "#E2E8F0" },
  EXAMS_100: { from: "#FBBF24", via: "#F59E0B", to: "#D97706", ring: "#FEF3C7" },
  EXAMS_CREATED_10: { from: "#EC4899", via: "#DB2777", to: "#9D174D", ring: "#FCE7F3" },
  STUDY_1_HOUR: { from: "#6EE7B7", via: "#10B981", to: "#047857", ring: "#D1FAE5" },
  STUDY_10_HOURS: { from: "#60A5FA", via: "#3B82F6", to: "#1D4ED8", ring: "#DBEAFE" },
  STUDY_50_HOURS: { from: "#C084FC", via: "#A855F7", to: "#7E22CE", ring: "#F3E8FF" },
  PERFECT_EXAM: { from: "#F472B6", via: "#EC4899", to: "#E11D48", ring: "#FFE4E6" },
  PERFECT_ANSWER: { from: "#34D399", via: "#059669", to: "#064E3B", ring: "#D1FAE5" },
  GREAT_ANSWER: { from: "#60A5FA", via: "#2563EB", to: "#1E40AF", ring: "#DBEAFE" },
  SECRET_NIGHT_OWL: { from: "#312E81", via: "#1E1B4B", to: "#0F172A", ring: "#818CF8" },
  SECRET_SUNDAY_STUDY: { from: "#FDBA74", via: "#F97316", to: "#C2410C", ring: "#FEF3C7" },
  SECRET_PERFECTIONIST: { from: "#F87171", via: "#EF4444", to: "#B91C1C", ring: "#FEE2E2" }
};

export function AchievementMedal({ code, locked = false, size = "md" }: AchievementMedalProps) {
  const theme = medalThemes[code] || medalThemes.FIRST_ANSWER;
  const dimensions = medalSizes[size];

  return (
    <View
      style={[
        styles.medal,
        {
          width: dimensions.outer,
          height: dimensions.outer,
          borderRadius: dimensions.outer / 2,
          borderColor: locked ? "#CBD5E1" : theme.ring,
          backgroundColor: locked ? "#E2E8F0" : theme.via,
          opacity: locked ? 0.48 : 1
        }
      ]}
    >
      <View
        style={[
          styles.medalMiddle,
          {
            width: dimensions.middle,
            height: dimensions.middle,
            borderRadius: dimensions.middle / 2,
            backgroundColor: locked ? "#94A3B8" : theme.from
          }
        ]}
      />
      <View
        style={[
          styles.medalCore,
          {
            width: dimensions.middle - 8,
            height: dimensions.middle - 8,
            borderRadius: (dimensions.middle - 8) / 2,
            backgroundColor: locked ? "#64748B" : theme.to
          }
        ]}
      />
      <View style={styles.medalGloss} />
      <View style={{ width: dimensions.inner, height: dimensions.inner }}>
        <MedalIllustration code={code} />
      </View>
    </View>
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
    default:
      return <FirstAnswerMedalSvg />;
  }
}

function SvgShell({ children }: { children: React.ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF8D6" />
          <Stop offset="20%" stopColor="#FBBF24" />
          <Stop offset="50%" stopColor="#D97706" />
          <Stop offset="85%" stopColor="#92400E" />
          <Stop offset="100%" stopColor="#78350F" />
        </LinearGradient>
        <LinearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="25%" stopColor="#E2E8F0" />
          <Stop offset="50%" stopColor="#94A3B8" />
          <Stop offset="75%" stopColor="#475569" />
          <Stop offset="100%" stopColor="#1E293B" />
        </LinearGradient>
        <LinearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFEDD5" />
          <Stop offset="30%" stopColor="#FB923C" />
          <Stop offset="70%" stopColor="#C2410C" />
          <Stop offset="100%" stopColor="#7C2D12" />
        </LinearGradient>
        <LinearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="50%" stopColor="#F97316" />
          <Stop offset="100%" stopColor="#FACC15" />
        </LinearGradient>
        <LinearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#991B1B" />
          <Stop offset="60%" stopColor="#DC2626" />
          <Stop offset="100%" stopColor="#F97316" />
        </LinearGradient>
        <LinearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00F5FF" />
          <Stop offset="50%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#7C3AED" />
        </LinearGradient>
        <LinearGradient id="neonCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A5F3FC" />
          <Stop offset="50%" stopColor="#06B6D4" />
          <Stop offset="100%" stopColor="#0891B2" />
        </LinearGradient>
        <LinearGradient id="neonPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBCFE8" />
          <Stop offset="50%" stopColor="#EC4899" />
          <Stop offset="100%" stopColor="#BE185D" />
        </LinearGradient>
        <LinearGradient id="neonPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E9D5FF" />
          <Stop offset="50%" stopColor="#A855F7" />
          <Stop offset="100%" stopColor="#7E22CE" />
        </LinearGradient>
        <LinearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#E2E8F0" />
        </LinearGradient>
      </Defs>
      {children}
    </Svg>
  );
}

function Spark({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <Path
      d={`M ${x} ${y - 6 * size} L ${x + 1.8 * size} ${y - 1.8 * size} L ${x + 6 * size} ${y} L ${x + 1.8 * size} ${y + 1.8 * size} L ${x} ${y + 6 * size} L ${x - 1.8 * size} ${y + 1.8 * size} L ${x - 6 * size} ${y} L ${x - 1.8 * size} ${y - 1.8 * size} Z`}
      fill="#FFFFFF"
      opacity={0.95}
    />
  );
}

function ProfileMedalSvg() {
  return (
    <SvgShell>
      <Spark x={48} y={12} size={0.7} />
      <G>
        <Circle cx="32" cy="32" r="23" fill="url(#silverGrad)" />
        <Circle cx="32" cy="32" r="20" fill="#0F172A" />
        <Circle cx="32" cy="32" r="18" fill="url(#neonCyanGrad)" opacity={0.15} />
        <Path d="M18 45c1.5-6 6-9 14-9s12.5 3 14 9" fill="url(#neonCyanGrad)" />
        <Circle cx="32" cy="24" r="7.5" fill="url(#neonCyanGrad)" />
        <Path d="M26 15l2.5 3 3.5-3.5 3.5 3.5 2.5-3-1.5 5h-9z" fill="url(#goldGrad)" />
        <Circle cx="45" cy="20" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth={1} />
        <Path d="M43 20l1.5 1.5 3-3" fill="none" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </SvgShell>
  );
}

function CompletedExamMedalSvg() {
  return (
    <SvgShell>
      <Spark x={15} y={15} size={0.7} />
      <G>
        <Rect x="18" y="10" width="28" height="42" rx="4" fill="url(#bronzeGrad)" />
        <Rect x="20" y="12" width="24" height="38" rx="2" fill="url(#paperGrad)" />
        <Path d="M28 8h8v5h-8z" fill="url(#silverGrad)" />
        <Line x1="24" y1="20" x2="40" y2="20" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" />
        <Line x1="24" y1="27" x2="36" y2="27" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" />
        <Line x1="24" y1="34" x2="32" y2="34" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx="38" cy="40" r="8" fill="#10B981" />
        <Circle cx="38" cy="40" r="6" fill="url(#goldGrad)" />
        <Path d="M35.5 40l2 2 3.5-3.5" fill="none" stroke="#78350F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </SvgShell>
  );
}

function CreatedExamMedalSvg() {
  return (
    <SvgShell>
      <G>
        <Path d="M32 6 L50 14 V32 C50 43 43 51 32 56 C21 51 14 43 14 32 V14 Z" fill="url(#paperGrad)" stroke="url(#goldGrad)" strokeWidth={1.8} />
        <Path d="M22 18 h20 v22 h-20 z" fill="#FFFBEB" stroke="#B45309" strokeWidth={1.2} />
        <Line x1="25" y1="24" x2="39" y2="24" stroke="#D97706" strokeWidth={2} />
        <Line x1="25" y1="30" x2="35" y2="30" stroke="#D97706" strokeWidth={2} />
        <Path d="M44 14 L30 35 L33 37 L47 16 Z" fill="url(#cyberGrad)" />
        <Path d="M30 35l-3 4 4-1z" fill="#FFFFFF" />
      </G>
      <Spark x={22} y={12} size={0.65} />
      <Spark x={46} y={40} size={0.5} />
    </SvgShell>
  );
}

function FirstStreakMedalSvg() {
  return (
    <SvgShell>
      <Spark x={48} y={15} size={0.6} />
      <G>
        <Circle cx="32" cy="32" r="23" fill="none" stroke="url(#bronzeGrad)" strokeWidth={3} />
        <Path d="M32 50 C22 50 16 42 16 33 C16 23 24 16 27 10 C27 20 30 22 32 18 C34 22 37 20 37 10 C40 16 48 23 48 33 C48 42 42 50 32 50 Z" fill="url(#flameOuter)" />
        <Path d="M32 47 C25 47 21 41 21 34 C21 26 27 21 29 16 C29 24 31 25 32 22 C33 25 35 24 35 16 C37 21 43 26 43 34 C43 41 39 47 32 47 Z" fill="url(#flameInner)" />
        <Circle cx="32" cy="36" r="3" fill="#FFFBEB" />
      </G>
    </SvgShell>
  );
}

function SevenDayStreakMedalSvg() {
  return (
    <SvgShell>
      <Spark x={15} y={12} size={0.7} />
      <Spark x={49} y={12} size={0.7} />
      <G>
        <Path d="M32 6 L50 14 V32 C50 43 43 51 32 56 C21 51 14 43 14 32 V14 Z" fill="none" stroke="url(#goldGrad)" strokeWidth={3} />
        <Path d="M32 48 C24 48 18 40 18 31 C18 20 28 14 32 8 C36 14 46 20 46 31 C46 40 40 48 32 48 Z" fill="url(#flameOuter)" />
        <Path d="M32 45 C26 45 21 38 21 30 C21 21 29 16 32 11 C35 16 43 21 43 30 C43 38 38 45 32 45 Z" fill="url(#flameInner)" />
        <SvgText x="32.5" y="37.5" textAnchor="middle" fontSize="20" fontWeight="900" fill="#FFFFFF" stroke="#78350F" strokeWidth={1.4}>7</SvgText>
      </G>
    </SvgShell>
  );
}

function FirstAnswerMedalSvg() {
  return (
    <SvgShell>
      <Spark x={48} y={12} size={0.6} />
      <G>
        <Path d="M12 18c0-4.4 3.6-8 8-8h24c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H26l-10 8v-8h-4c-4.4 0-8-3.6-8-8V18z" fill="url(#neonCyanGrad)" />
        <Path d="M14 19c0-3.3 2.7-6 6-6h24c3.3 0 6 2.7 6 6v14c0 3.3-2.7 6-6 6H25.2L18 39.8v-4.8h-4c-3.3 0-6-2.7-6-6V19z" fill="#0F172A" opacity={0.85} />
        <Path d="M36 16 L48 28 L28 48 L16 48 L16 36 Z" fill="none" stroke="url(#goldGrad)" strokeWidth={2.5} />
        <Path d="M16 48l6-1.5L17.5 42z" fill="url(#goldGrad)" />
        <Circle cx="32" cy="24" r="8" fill="#10B981" />
        <Path d="M29 24l2 2 4-4" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </SvgShell>
  );
}

function CommunityPostMedalSvg() {
  return (
    <SvgShell>
      <Spark x={49} y={14} size={0.65} />
      <G>
        <Circle cx="32" cy="32" r="23" fill="none" stroke="url(#neonPinkGrad)" strokeWidth={2.5} />
        <Path d="M18 26 h8 l10 -8 v28 l-10 -8 h-8 z" fill="url(#neonPinkGrad)" />
        <Path d="M36 18 c4 0 7 6 7 14 s-3 14 -7 14" fill="none" stroke="url(#goldGrad)" strokeWidth={3.2} strokeLinecap="round" />
        <Path d="M43 22 c3 3 3 7 0 10 M47 18 c5 5 5 13 0 18" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
        <Path d="M22 34 v6 a2 2 0 0 0 2 2 h1 v-8 z" fill="#64748B" />
      </G>
    </SvgShell>
  );
}

function ConnectionMedalSvg() {
  return (
    <SvgShell>
      <Spark x={32} y={18} size={0.8} />
      <Spark x={32} y={46} size={0.5} />
      <G>
        <Circle cx="25" cy="32" r="12" fill="none" stroke="url(#neonCyanGrad)" strokeWidth={4.5} />
        <Circle cx="39" cy="32" r="12" fill="none" stroke="url(#goldGrad)" strokeWidth={4.5} />
        <Circle cx="32" cy="32" r="4" fill="#FFFFFF" />
      </G>
    </SvgShell>
  );
}

function Connection10MedalSvg() {
  return (
    <SvgShell>
      <Spark x={46} y={15} size={0.55} />
      <G>
        <Circle cx="32" cy="32" r="23" fill="none" stroke="#10B981" strokeWidth={3} />
        <Path d="M14 36c-2-6 0-14 6-18 M50 36c2-6 0-14-6-18" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <Path d="M22 38 l10 -15 l10 15 Z M32 15 v15" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.8} />
        <Circle cx="32" cy="15" r="4" fill="url(#goldGrad)" />
        <Circle cx="22" cy="38" r="4" fill="url(#neonCyanGrad)" />
        <Circle cx="42" cy="38" r="4" fill="url(#neonCyanGrad)" />
        <Circle cx="32" cy="30" r="8" fill="#0F172A" stroke="url(#goldGrad)" strokeWidth={1.5} />
        <SvgText x="32" y="34.5" textAnchor="middle" fontSize="12.5" fontWeight="900" fill="#FFFFFF">10</SvgText>
      </G>
    </SvgShell>
  );
}

function Exams10MedalSvg() {
  return (
    <SvgShell>
      <Spark x={46} y={18} size={0.6} />
      <G>
        <Path d="M32 6 L52 14 V30 C52 42 43 51 32 56 C21 51 12 42 12 30 V14 Z" fill="url(#bronzeGrad)" />
        <Path d="M32 9 L49 16 V29 C49 40 40 48 32 53 C24 48 15 40 15 29 V16 Z" fill="#1E293B" />
        <Rect x="22" y="18" width="20" height="22" rx="2" fill="url(#paperGrad)" />
        <Line x1="26" y1="24" x2="38" y2="24" stroke="#94A3B8" strokeWidth={2} />
        <Line x1="26" y1="30" x2="34" y2="30" stroke="#94A3B8" strokeWidth={2} />
        <Circle cx="32" cy="40" r="11" fill="url(#bronzeGrad)" stroke="#FFFFFF" strokeWidth={1} />
        <SvgText x="32" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">10</SvgText>
      </G>
    </SvgShell>
  );
}

function Exams50MedalSvg() {
  return (
    <SvgShell>
      <Spark x={16} y={16} size={0.6} />
      <Spark x={48} y={16} size={0.6} />
      <G>
        <Path d="M32 6 L52 14 V30 C52 42 43 51 32 56 C21 51 12 42 12 30 V14 Z" fill="url(#silverGrad)" />
        <Path d="M32 9 L49 16 V29 C49 40 40 48 32 53 C24 48 15 40 15 29 V16 Z" fill="#0F172A" />
        <Rect x="22" y="18" width="20" height="22" rx="2" fill="url(#paperGrad)" />
        <Line x1="26" y1="24" x2="38" y2="24" stroke="#94A3B8" strokeWidth={2} />
        <Line x1="26" y1="30" x2="34" y2="30" stroke="#94A3B8" strokeWidth={2} />
        <Circle cx="32" cy="40" r="11" fill="url(#silverGrad)" stroke="#FFFFFF" strokeWidth={1} />
        <SvgText x="32" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0F172A">50</SvgText>
      </G>
    </SvgShell>
  );
}

function Exams100MedalSvg() {
  return (
    <SvgShell>
      <Spark x={32} y={8} size={0.7} />
      <Spark x={15} y={15} size={0.55} />
      <Spark x={49} y={15} size={0.55} />
      <G>
        <Path d="M32 6 L52 14 V30 C52 42 43 51 32 56 C21 51 12 42 12 30 V14 Z" fill="url(#goldGrad)" />
        <Path d="M32 9 L49 16 V29 C49 40 40 48 32 53 C24 48 15 40 15 29 V16 Z" fill="#07111F" />
        <Path d="M18 36c-2-6 0-14 6-18 M46 36c2-6 0-14-6-18" fill="none" stroke="url(#goldGrad)" strokeWidth={2.5} strokeLinecap="round" />
        <Rect x="22" y="18" width="20" height="22" rx="2" fill="url(#paperGrad)" />
        <Line x1="26" y1="24" x2="38" y2="24" stroke="url(#goldGrad)" strokeWidth={2} />
        <Line x1="26" y1="30" x2="34" y2="30" stroke="url(#goldGrad)" strokeWidth={2} />
        <Circle cx="32" cy="40" r="12.5" fill="url(#goldGrad)" stroke="#FFFFFF" strokeWidth={1} />
        <SvgText x="32" y="43.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#78350F">100</SvgText>
      </G>
    </SvgShell>
  );
}

function ExamsCreated10MedalSvg() {
  return (
    <SvgShell>
      <Spark x={48} y={14} size={0.65} />
      <G>
        <Path d="M14 12 h16 l6 6 h14 a4 4 0 0 1 4 4 v22 a4 4 0 0 1 -4 4 h-36 a4 4 0 0 1 -4 -4 z" fill="url(#neonPinkGrad)" />
        <Path d="M16 16 h14 l4 4 h14 v20 h-32 z" fill="#0F172A" opacity={0.85} />
        <Rect x="20" y="22" width="16" height="12" rx="1.5" fill="url(#paperGrad)" />
        <Line x1="23" y1="26" x2="33" y2="26" stroke="#C084FC" strokeWidth={2} />
        <Line x1="23" y1="30" x2="29" y2="30" stroke="#C084FC" strokeWidth={2} />
        <Circle cx="42" cy="38" r="9" fill="url(#neonPurpleGrad)" />
        <SvgText x="42" y="41.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">+10</SvgText>
      </G>
    </SvgShell>
  );
}

function Study1HourMedalSvg() {
  return (
    <SvgShell>
      <Spark x={46} y={18} size={0.5} />
      <G>
        <Circle cx="32" cy="34" r="20" fill="url(#paperGrad)" stroke="#10B981" strokeWidth={3} />
        <Path d="M30 10 h4 v4 h-4 z" fill="#10B981" />
        <Path d="M32 14 v4" stroke="#10B981" strokeWidth={2} />
        <Circle cx="32" cy="34" r="16" fill="#0F172A" />
        <Circle cx="32" cy="34" r="14" fill="none" stroke="#A7F3D0" strokeWidth={1} strokeDasharray="3,3" />
        <Path d="M32 34 v-11 l6 3" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x="32" y="46" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">1h</SvgText>
      </G>
    </SvgShell>
  );
}

function Study10HoursMedalSvg() {
  return (
    <SvgShell>
      <Spark x={16} y={20} size={0.5} />
      <Spark x={48} y={20} size={0.5} />
      <G>
        <Circle cx="32" cy="34" r="20" fill="url(#paperGrad)" stroke="#3B82F6" strokeWidth={3} />
        <Path d="M30 10 h4 v4 h-4 z" fill="#3B82F6" />
        <Path d="M32 14 v4" stroke="#3B82F6" strokeWidth={2} />
        <Circle cx="32" cy="34" r="16" fill="#0F172A" />
        <Circle cx="32" cy="34" r="14" fill="none" stroke="#DBEAFE" strokeWidth={1} strokeDasharray="3,3" />
        <Path d="M32 34 v-12 l8 6" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x="32" y="46" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">10h</SvgText>
      </G>
    </SvgShell>
  );
}

function Study50HoursMedalSvg() {
  return (
    <SvgShell>
      <Spark x={32} y={8} size={0.65} />
      <Spark x={49} y={18} size={0.6} />
      <G>
        <Path d="M12 34c-6-4-8-10-8-10s8 2 10 6M52 34c6-4 8-10 8-10s-8 2-10 6" stroke="url(#goldGrad)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx="32" cy="34" r="20" fill="url(#goldGrad)" stroke="#A855F7" strokeWidth={2} />
        <Circle cx="32" cy="34" r="17" fill="#07111F" />
        <Circle cx="32" cy="34" r="14" fill="none" stroke="#F3E8FF" strokeWidth={1} strokeDasharray="3,3" />
        <Path d="M32 34 v-13 l10 3" stroke="#A855F7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x="32" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">50h</SvgText>
      </G>
    </SvgShell>
  );
}

function PerfectExamMedalSvg() {
  return (
    <SvgShell>
      <Spark x={32} y={12} size={0.8} />
      <Spark x={15} y={15} size={0.6} />
      <Spark x={49} y={15} size={0.6} />
      <G>
        <Path d="M14 38c-3-6 0-16 8-20 M50 38c3-6 0-16-8-20" fill="none" stroke="url(#goldGrad)" strokeWidth={3} strokeLinecap="round" />
        <Path d="M18 42 L46 42 L42 22 L32 32 L22 22 Z" fill="url(#goldGrad)" stroke="#FFFFFF" strokeWidth={1} />
        <Circle cx="18" cy="42" r="2" fill="#FFFFFF" />
        <Circle cx="46" cy="42" r="2" fill="#FFFFFF" />
        <Circle cx="22" cy="22" r="2.5" fill="#FFFFFF" />
        <Circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />
        <Circle cx="42" cy="22" r="2.5" fill="#FFFFFF" />
        <Circle cx="32" cy="38" r="10" fill="#E11D48" stroke="url(#goldGrad)" strokeWidth={1.5} />
        <SvgText x="32.5" y="41.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">10</SvgText>
      </G>
    </SvgShell>
  );
}

function PerfectAnswerMedalSvg() {
  return (
    <SvgShell>
      <Spark x={46} y={10} size={0.7} />
      <G>
        <Circle cx="32" cy="32" r="22" fill="url(#goldGrad)" />
        <Circle cx="32" cy="32" r="17" fill="#10B981" />
        <Circle cx="32" cy="32" r="12" fill="#FFFFFF" />
        <Circle cx="32" cy="32" r="7" fill="#E11D48" />
        <Path d="M12 48 L46 14" stroke="#78350F" strokeWidth={3} strokeLinecap="round" />
        <Path d="M46 14l2-6-6 2z" fill="url(#goldGrad)" />
        <Path d="M12 48l-4 4 1-5z M13 47l-5 2 3-4z" fill="#E2E8F0" />
        <SvgText x="32" y="35" textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">10</SvgText>
      </G>
    </SvgShell>
  );
}

function GreatAnswerMedalSvg() {
  return (
    <SvgShell>
      <Spark x={45} y={12} size={0.55} />
      <G>
        <Circle cx="32" cy="32" r="22" fill="url(#silverGrad)" />
        <Circle cx="32" cy="32" r="17" fill="#3B82F6" />
        <Circle cx="32" cy="32" r="12" fill="#FFFFFF" />
        <Circle cx="32" cy="32" r="7.5" fill="url(#silverGrad)" />
        <Path d="M14 46 L44 16" stroke="#475569" strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M44 16l1-5-5 1z" fill="url(#silverGrad)" />
        <SvgText x="32" y="34.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0F172A">7.5</SvgText>
      </G>
    </SvgShell>
  );
}

function SecretNightOwlMedalSvg() {
  return (
    <SvgShell>
      <Spark x={22} y={15} size={0.5} />
      <Spark x={45} y={15} size={0.65} />
      <G>
        <Circle cx="32" cy="32" r="21" fill="#0F172A" stroke="#818CF8" strokeWidth={2.2} />
        <Path d="M42 22 A15 15 0 0 1 20 40 A15 15 0 1 0 42 22 Z" fill="url(#goldGrad)" />
        <G transform="translate(18, 22)">
          <Path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6s-2.7 6-6 6s-6-2.7-6-6z" fill="url(#neonPurpleGrad)" />
          <Circle cx="9" cy="16" r="3.5" fill="#FFFFFF" />
          <Circle cx="15" cy="16" r="3.5" fill="#FFFFFF" />
          <Line x1="8" y1="16" x2="10" y2="16" stroke="#0F172A" strokeWidth={1.2} />
          <Line x1="14" y1="16" x2="16" y2="16" stroke="#0F172A" strokeWidth={1.2} />
          <Path d="M12 18l-1.5-2h3z" fill="url(#goldGrad)" />
          <Path d="M8 12l-2-3 4 1.5 M16 12l2-3-4 1.5" stroke="#FFFFFF" strokeWidth={1.2} fill="none" />
        </G>
      </G>
    </SvgShell>
  );
}

function SecretSundayStudyMedalSvg() {
  return (
    <SvgShell>
      <Spark x={48} y={18} size={0.6} />
      <G>
        <Path d="M32 8l4 6 7-3-2 7 7 1-5 5 4 6-7-1-2 7-4-6-4 6-2-7-7 1 4-6-5-5 7-1-2-7 7 3z" fill="url(#goldGrad)" />
        <Circle cx="32" cy="32" r="16" fill="#F59E0B" stroke="#FFFFFF" strokeWidth={1.5} />
        <Rect x="22" y="24" width="20" height="16" rx="2" fill="url(#paperGrad)" stroke="#78350F" strokeWidth={1.5} />
        <Rect x="22" y="24" width="20" height="5" fill="#EF4444" />
        <SvgText x="32" y="34.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350F">DOM</SvgText>
      </G>
    </SvgShell>
  );
}

function SecretPerfectionistMedalSvg() {
  return (
    <SvgShell>
      <Spark x={32} y={6} size={0.7} />
      <Spark x={16} y={42} size={0.5} />
      <Spark x={48} y={42} size={0.5} />
      <G>
        <Path d="M32 8 L49 18 V38 L32 48 L15 38 V18 Z" fill="#EF4444" stroke="url(#goldGrad)" strokeWidth={2.5} />
        <Path d="M32 11 L46 20 V36 L32 45 L18 36 V20 Z" fill="#0F172A" opacity={0.85} />
        <Path d="M32 15 L24 35 M32 15 L40 35" stroke="url(#goldGrad)" strokeWidth={3} strokeLinecap="round" />
        <Circle cx="32" cy="15" r="3" fill="#FFFFFF" />
        <Circle cx="32" cy="32" r="8" fill="url(#goldGrad)" />
        <SvgText x="32.5" y="35.5" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#78350F">10</SvgText>
      </G>
    </SvgShell>
  );
}

const styles = StyleSheet.create({
  medal: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    overflow: "hidden",
    shadowColor: "#0879F2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  medalMiddle: {
    position: "absolute"
  },
  medalCore: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)"
  },
  medalGloss: {
    position: "absolute",
    left: "18%",
    top: "14%",
    width: "24%",
    height: "24%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)"
  }
});
