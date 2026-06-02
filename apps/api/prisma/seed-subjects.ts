import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from 'dotenv';

config({ path: '../../.env' });

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/examina?schema=public";
const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
});

const SUBJECTS = [
  { name: "Biología", slug: "biologia" },
  { name: "Dibujo Técnico II", slug: "dibujo-tecnico-ii" },
  { name: "Economía de la Empresa", slug: "economia-de-la-empresa" },
  { name: "Historia de la Filosofía", slug: "historia-de-la-filosofia" },
  { name: "Física", slug: "fisica" },
  { name: "Geografía", slug: "geografia" },
  { name: "Historia de España", slug: "historia-de-espana" },
  { name: "Inglés", slug: "ingles" },
  { name: "Latín II", slug: "latin-ii" },
  { name: "Lengua Castellana y Literatura", slug: "lengua-y-literatura" },
  { name: "Matemáticas II", slug: "matematicas-ii" },
  { name: "Matemáticas de Ciencias Sociales", slug: "matematicas-ccss" },
  { name: "Química", slug: "quimica" },
  { name: "Tecnología e Ingeniería II", slug: "tecnologia-e-ingenieria-ii" },
];

async function main() {
  console.log('Iniciando el script de seeding de materias...');

  for (const subject of SUBJECTS) {
    const existing = await prisma.subject.findUnique({
      where: { slug: subject.slug }
    });

    if (!existing) {
      await prisma.subject.create({
        data: {
          name: subject.name,
          slug: subject.slug,
          description: `Materia oficial de ${subject.name} para la preparación de la PAU.`
        }
      });
      console.log(`✅ Creada materia: ${subject.name}`);
    } else {
      console.log(`ℹ️ Materia ya existía: ${subject.name}`);
    }
  }

  console.log('¡Seeding de materias completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
