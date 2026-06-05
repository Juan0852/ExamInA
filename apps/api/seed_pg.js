const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  connectionString: 'postgresql://juanmontero:123456789@localhost:5432/examina?schema=public'
});

const ACHIEVEMENT_CATALOG = [
  { code: "PROFILE_80", title: "Perfil brillante", description: "Completa nombre, descripcion e imagen de perfil.", icon: "profile-80", experienceReward: 120 },
  { code: "FIRST_EXAM_COMPLETED", title: "Primer examen cerrado", description: "Completa tu primer examen en ExamInA.", icon: "first-exam-completed", experienceReward: 180 },
  { code: "FIRST_EXAM_CREATED", title: "Creador de retos", description: "Crea tu primer examen para estudiar o compartir.", icon: "first-exam-created", experienceReward: 160 },
  { code: "FIRST_STREAK_DAY", title: "Chispa inicial", description: "Consigue tu primer dia de racha de estudio.", icon: "first-streak-day", experienceReward: 80 },
  { code: "STREAK_7_DAYS", title: "Semana imparable", description: "Mantén una racha de estudio de 7 dias.", icon: "streak-7-days", experienceReward: 260 },
  { code: "FIRST_ANSWER", title: "Primera respuesta", description: "Responde tu primera pregunta de practica.", icon: "first-answer", experienceReward: 90 },
  { code: "FIRST_COMMUNITY_POST", title: "Voz en la comunidad", description: "Publica por primera vez en la comunidad.", icon: "first-community-post", experienceReward: 140 },
  { code: "FIRST_CONNECTION", title: "Primera conexion", description: "Conecta con tu primer companero de estudio.", icon: "first-connection", experienceReward: 130 },
  { code: "CONNECTION_10", title: "Red de estudio", description: "Conecta con 10 companeros de estudio.", icon: "connection-10", experienceReward: 250 },
  { code: "EXAMS_10", title: "Veterano de pruebas", description: "Completa 10 examenes en ExamInA.", icon: "exams-10", experienceReward: 200 },
  { code: "EXAMS_50", title: "Maestro del examen", description: "Completa 50 examenes en ExamInA.", icon: "exams-50", experienceReward: 500 },
  { code: "EXAMS_100", title: "Leyenda de los simulacros", description: "Completa 100 examenes en ExamInA.", icon: "exams-100", experienceReward: 1000 },
  { code: "EXAMS_CREATED_10", title: "Director de retos", description: "Crea y comparte 10 examenes en la plataforma.", icon: "exams-created-10", experienceReward: 350 },
  { code: "STUDY_1_HOUR", title: "Primer paso", description: "Acumula 1 hora de estudio activo.", icon: "study-1-hour", experienceReward: 100 },
  { code: "STUDY_10_HOURS", title: "Estudiante enfocado", description: "Acumula 10 horas de estudio activo.", icon: "study-10-hours", experienceReward: 300 },
  { code: "STUDY_50_HOURS", title: "Cerebro de hierro", description: "Acumula 50 horas de estudio activo.", icon: "study-50-hours", experienceReward: 800 },
  { code: "PERFECT_EXAM", title: "Perfeccion absoluta", description: "Obten un 10 perfecto en un examen completo.", icon: "perfect-exam", experienceReward: 400 },
  { code: "PERFECT_ANSWER", title: "Perfeccion individual", description: "Saca un 10 perfecto en una pregunta.", icon: "perfect-answer", experienceReward: 150 },
  { code: "GREAT_ANSWER", title: "Camino a la excelencia", description: "Saca un 7.5 o mas en una pregunta.", icon: "great-answer", experienceReward: 100 },
  { code: "SECRET_NIGHT_OWL", title: "🦉 Buho nocturno (Secreto)", description: "?? (Desbloqueado tras estudiar de madrugada)", icon: "secret-night-owl", experienceReward: 300 },
  { code: "SECRET_SUNDAY_STUDY", title: "☀️ Domingo de devocion (Secreto)", description: "?? (Desbloqueado tras estudiar en domingo)", icon: "secret-sunday-study", experienceReward: 250 },
  { code: "SECRET_PERFECTIONIST", title: "🎯 Precision matematica (Secreto)", description: "?? (Desbloqueado tras sacar un 10 en matematicas)", icon: "secret-perfectionist", experienceReward: 350 }
];

async function run() {
  await client.connect();
  for (const ach of ACHIEVEMENT_CATALOG) {
    const id = uuidv4();
    await client.query(`
      INSERT INTO achievements (id, code, title, description, icon, "experienceReward")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (code) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        "experienceReward" = EXCLUDED."experienceReward"
    `, [id, ach.code, ach.title, ach.description, ach.icon, ach.experienceReward]);
  }
  console.log("Achievements inserted");
  await client.end();
}

run().catch(console.error);
