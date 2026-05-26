import type { AchievementCatalogItem } from "../entities/achievement.entity";

export const ACHIEVEMENT_CATALOG: AchievementCatalogItem[] = [
  {
    code: "PROFILE_80",
    title: "Perfil brillante",
    description: "Completa nombre, descripcion e imagen de perfil.",
    icon: "profile-80",
    experienceReward: 120
  },
  {
    code: "FIRST_EXAM_COMPLETED",
    title: "Primer examen cerrado",
    description: "Completa tu primer examen en ExamInA.",
    icon: "first-exam-completed",
    experienceReward: 180
  },
  {
    code: "FIRST_EXAM_CREATED",
    title: "Creador de retos",
    description: "Crea tu primer examen para estudiar o compartir.",
    icon: "first-exam-created",
    experienceReward: 160
  },
  {
    code: "FIRST_STREAK_DAY",
    title: "Chispa inicial",
    description: "Consigue tu primer dia de racha de estudio.",
    icon: "first-streak-day",
    experienceReward: 80
  },
  {
    code: "STREAK_7_DAYS",
    title: "Semana imparable",
    description: "Mantén una racha de estudio de 7 dias.",
    icon: "streak-7-days",
    experienceReward: 260
  },
  {
    code: "FIRST_ANSWER",
    title: "Primera respuesta",
    description: "Responde tu primera pregunta de practica.",
    icon: "first-answer",
    experienceReward: 90
  },
  {
    code: "FIRST_COMMUNITY_POST",
    title: "Voz en la comunidad",
    description: "Publica por primera vez en la comunidad.",
    icon: "first-community-post",
    experienceReward: 140
  },
  {
    code: "FIRST_CONNECTION",
    title: "Primera conexion",
    description: "Conecta con tu primer companero de estudio.",
    icon: "first-connection",
    experienceReward: 130
  }
];
