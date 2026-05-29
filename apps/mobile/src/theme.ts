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

    // Dark theme (Sleek Academic dark mode as default/main preference for mobile screens)
    background: "#07111F",
    surface: "#0E1B2F",
    surfaceMuted: "#12243B",
    border: "#223A59",
    borderStrong: "#2D5E91",
    text: "#EAF2FF",
    textMuted: "#B7C6D9",
    textSoft: "#8FA4BC",

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
