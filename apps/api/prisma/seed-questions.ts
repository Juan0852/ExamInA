import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from 'dotenv';

config({ path: '../../.env' }); // Root .env

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/examina?schema=public";
const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
});

async function main() {
  console.log('Iniciando el script de seeding de preguntas...');

  // 1. Obtener todas las materias
  const subjects = await prisma.subject.findMany();

  if (subjects.length === 0) {
    console.log('No se encontraron materias. Por favor corre el seeder de materias primero.');
    return;
  }

  console.log(`Se encontraron ${subjects.length} materias. Generando preguntas...`);

  for (const subject of subjects) {
    // 2. Obtener o crear un tema por defecto para la materia
    let topic = await prisma.topic.findFirst({
      where: { subjectId: subject.id }
    });

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          name: `Introducción a ${subject.name}`,
          slug: `introduccion-${subject.slug}`,
        }
      });
      console.log(`Creado tema por defecto para ${subject.name}`);
    }

    // 3. Crear 5 preguntas para esta materia y tema
    const questionsToCreate = [
      { statement: `¿Cuál es el concepto fundamental más importante en ${subject.name}?` },
      { statement: `Menciona un postulado clave de la materia de ${subject.name}.` },
      { statement: `¿Qué hito histórico marcó el desarrollo de ${subject.name}?` },
      { statement: `Describe brevemente una aplicación práctica de ${subject.name}.` },
      { statement: `¿Cuáles son los principales desafíos actuales en ${subject.name}?` },
    ];

    for (const q of questionsToCreate) {
      // Verificar si ya existe una pregunta similar para evitar duplicados masivos
      const exists = await prisma.question.findFirst({
        where: {
          subjectId: subject.id,
          statement: q.statement
        }
      });

      if (!exists) {
        await prisma.question.create({
          data: {
            subjectId: subject.id,
            topicId: topic.id,
            statement: q.statement,
            type: 'OPEN_ANSWER',
            difficulty: 'EASY',
            solution: {
              create: {
                finalAnswer: 'Respuesta generada automáticamente.',
                explanation: `Esta es una respuesta modelo autogenerada para el concepto de ${subject.name}.`
              }
            }
          }
        });
      }
    }
    console.log(`✅ 5 preguntas verificadas/creadas para ${subject.name}`);
  }

  console.log('¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
