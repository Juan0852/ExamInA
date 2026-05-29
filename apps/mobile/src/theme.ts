/**
 * Sistema de diseño de ExamInA adaptado para React Native (Mobile).
 * Basado en docs/FRONTEND_STYLE_GUIDE.md.
 */
export const theme = {
  colors: {
    // Brand
    brandNavy: "#06265F",
    brandBlue: "#0879F2",
    brandCyan: "#33D6D0",
    brandSky: "#E8F7FF",

    // Light theme (as requested, dark mode is fully disabled)
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    border: "#D8E2EE",
    borderStrong: "#AFC1D6",
    text: "#0F172A",
    textMuted: "#475569",
    textSoft: "#64748B",

    // Semantic States
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#0879F2",

    // Utilities
    white: "#FFFFFF",
    black: "#000000",
  },
  spacing: {
    space1: 4,
    space2: 8,
    space3: 12,
    space4: 16,
    space5: 20,
    space6: 24,
    space8: 32,
    space10: 40,
    space12: 48,
    space16: 64,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
  },
};
