import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CommunityVisibility,
  PrismaClient,
  QuestionDifficulty,
  QuestionType,
  SharedExamStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? "")
});

const officialUserId = "official_examina_team";
const mathSubjectId = "math-sub-2";
const limitsTopicId = "math-topic-limits";
const officialExamId = "official_math_limits_exam_001";

const questions = [
  {
    id: "official_math_limits_q1",
    statement:
      "Calcula el límite $$\\lim_{x \\to 2}\\frac{x^2 - 4}{x - 2}$$ Explica el procedimiento utilizado.",
    difficulty: QuestionDifficulty.EASY,
    finalAnswer: "\\(4\\)",
    explanation:
      "Se factoriza \\(x^2 - 4\\) como \\((x - 2)(x + 2)\\), se simplifica el factor común y se evalúa \\(x + 2\\) en \\(x = 2\\)."
  },
  {
    id: "official_math_limits_q2",
    statement:
      "Calcula $$\\lim_{x \\to 0}\\frac{\\sin(3x)}{x}$$ e indica qué límite notable has utilizado.",
    difficulty: QuestionDifficulty.EASY,
    finalAnswer: "\\(3\\)",
    explanation:
      "Se reescribe \\(\\frac{\\sin(3x)}{x}\\) como \\(3\\cdot\\frac{\\sin(3x)}{3x}\\). Por el límite notable \\(\\frac{\\sin u}{u}\\to 1\\), el resultado es \\(3\\)."
  },
  {
    id: "official_math_limits_q3",
    statement:
      "Estudia la continuidad de $$f(x)=\\frac{x^2 - 1}{x - 1}$$ en \\(x = 1\\) y di si puede redefinirse para ser continua.",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "No es continua en \\(x = 1\\), pero puede redefinirse con \\(f(1)=2\\).",
    explanation:
      "La función no está definida en \\(x = 1\\). Al factorizar \\(x^2 - 1 = (x - 1)(x + 1)\\), el límite cuando \\(x\\) tiende a \\(1\\) es \\(2\\), por lo que la discontinuidad es evitable."
  },
  {
    id: "official_math_limits_q4",
    statement:
      "Calcula $$\\lim_{x \\to \\infty}\\frac{3x^2 - 5x + 1}{2x^2 + x - 7}$$",
    difficulty: QuestionDifficulty.EASY,
    finalAnswer: "\\(\\frac{3}{2}\\)",
    explanation:
      "En un cociente de polinomios del mismo grado, el límite en infinito es el cociente de los coeficientes principales: \\(\\frac{3}{2}\\)."
  },
  {
    id: "official_math_limits_q5",
    statement:
      "Calcula $$\\lim_{x \\to 0}\\frac{1 - \\cos x}{x^2}$$ y justifica el resultado con un límite notable o una equivalencia.",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "\\(\\frac{1}{2}\\)",
    explanation:
      "Usando la equivalencia \\(1 - \\cos x \\sim \\frac{x^2}{2}\\) cuando \\(x\\) tiende a \\(0\\), el cociente tiende a \\(\\frac{1}{2}\\)."
  },
  {
    id: "official_math_limits_q6",
    statement:
      "Determina el valor de \\(a\\) para que la función $$f(x)=\\begin{cases} ax + 1, & x < 2 \\\\ x^2 - 1, & x \\ge 2 \\end{cases}$$ sea continua en \\(x = 2\\).",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "\\(a = 1\\)",
    explanation:
      "Para continuidad en \\(x = 2\\), el límite por la izquierda debe coincidir con \\(f(2)\\). Se exige \\(2a + 1 = 2^2 - 1 = 3\\), luego \\(a = 1\\)."
  },
  {
    id: "official_math_limits_q7",
    statement:
      "Calcula $$\\lim_{x \\to 1}\\frac{x^3 - 1}{x^2 - 1}$$ Muestra la factorización necesaria.",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "\\(\\frac{3}{2}\\)",
    explanation:
      "Se factoriza \\(x^3 - 1 = (x - 1)(x^2 + x + 1)\\) y \\(x^2 - 1 = (x - 1)(x + 1)\\). Tras simplificar, se evalúa \\(\\frac{x^2 + x + 1}{x + 1}\\) en \\(x = 1\\)."
  },
  {
    id: "official_math_limits_q8",
    statement:
      "Estudia si existe $$\\lim_{x \\to 0}\\frac{|x|}{x}$$ Explica el comportamiento lateral.",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "No existe.",
    explanation:
      "Por la derecha \\(\\frac{|x|}{x}=1\\), mientras que por la izquierda \\(\\frac{|x|}{x}=-1\\). Como los límites laterales son distintos, el límite no existe."
  },
  {
    id: "official_math_limits_q9",
    statement:
      "Calcula $$\\lim_{x \\to \\infty}\\left(\\sqrt{x^2 + 3x} - x\\right)$$",
    difficulty: QuestionDifficulty.HARD,
    finalAnswer: "\\(\\frac{3}{2}\\)",
    explanation:
      "Se racionaliza multiplicando por el conjugado. El cociente resultante es \\(\\frac{3x}{\\sqrt{x^2 + 3x} + x}\\), que tiende a \\(\\frac{3}{2}\\)."
  },
  {
    id: "official_math_limits_q10",
    statement:
      "Calcula $$\\lim_{x \\to 0}\\frac{e^{2x} - 1}{x}$$ e indica la equivalencia usada.",
    difficulty: QuestionDifficulty.MEDIUM,
    finalAnswer: "\\(2\\)",
    explanation:
      "Con \\(u = 2x\\), \\(e^u - 1 \\sim u\\) cuando \\(u\\) tiende a \\(0\\). Entonces \\(\\frac{e^{2x} - 1}{x} \\sim \\frac{2x}{x} = 2\\)."
  }
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await prisma.user.upsert({
    where: { id: officialUserId },
    update: {
      displayName: "Equipo ExamInA",
      role: UserRole.ADMIN
    },
    create: {
      id: officialUserId,
      firebaseUid: "official-examina-team",
      email: "equipo@examina.local",
      displayName: "Equipo ExamInA",
      role: UserRole.ADMIN
    }
  });

  await prisma.subject.upsert({
    where: { id: mathSubjectId },
    update: {
      name: "Matemáticas II",
      slug: "matematicas-ii",
      description: "Preparación para Matemáticas II PAU/Selectividad"
    },
    create: {
      id: mathSubjectId,
      name: "Matemáticas II",
      slug: "matematicas-ii",
      description: "Preparación para Matemáticas II PAU/Selectividad"
    }
  });

  await prisma.topic.upsert({
    where: { id: limitsTopicId },
    update: {
      subjectId: mathSubjectId,
      name: "Límites y Continuidad",
      slug: "limites-y-continuidad"
    },
    create: {
      id: limitsTopicId,
      subjectId: mathSubjectId,
      name: "Límites y Continuidad",
      slug: "limites-y-continuidad"
    }
  });

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        subjectId: mathSubjectId,
        topicId: limitsTopicId,
        statement: question.statement,
        type: QuestionType.OPEN_ANSWER,
        difficulty: question.difficulty,
        sourceYear: 2026,
        sourceExam: "ExamInA Oficial - Límites"
      },
      create: {
        id: question.id,
        subjectId: mathSubjectId,
        topicId: limitsTopicId,
        statement: question.statement,
        type: QuestionType.OPEN_ANSWER,
        difficulty: question.difficulty,
        sourceYear: 2026,
        sourceExam: "ExamInA Oficial - Límites"
      }
    });

    await prisma.questionSolution.upsert({
      where: { questionId: question.id },
      update: {
        finalAnswer: question.finalAnswer,
        explanation: question.explanation,
        gradingCriteria: {
          maxScore: 10,
          criteria: [
            "Identifica correctamente el tipo de límite.",
            "Aplica el procedimiento algebraico o límite notable adecuado.",
            "Justifica el resultado final con claridad."
          ]
        }
      },
      create: {
        questionId: question.id,
        finalAnswer: question.finalAnswer,
        explanation: question.explanation,
        gradingCriteria: {
          maxScore: 10,
          criteria: [
            "Identifica correctamente el tipo de límite.",
            "Aplica el procedimiento algebraico o límite notable adecuado.",
            "Justifica el resultado final con claridad."
          ]
        }
      }
    });
  }

  await prisma.sharedExam.upsert({
    where: { id: officialExamId },
    update: {
      ownerId: officialUserId,
      title: "Examen Oficial ExamInA - Matemáticas II: Límites y Continuidad",
      description:
        "Simulacro oficial de 10 preguntas para probar límites, continuidad, límites notables y comportamiento en infinito.",
      visibility: CommunityVisibility.PUBLIC,
      status: SharedExamStatus.PUBLISHED,
      allowCloning: true
    },
    create: {
      id: officialExamId,
      ownerId: officialUserId,
      title: "Examen Oficial ExamInA - Matemáticas II: Límites y Continuidad",
      description:
        "Simulacro oficial de 10 preguntas para probar límites, continuidad, límites notables y comportamiento en infinito.",
      visibility: CommunityVisibility.PUBLIC,
      status: SharedExamStatus.PUBLISHED,
      allowCloning: true
    }
  });

  await prisma.sharedExamQuestion.deleteMany({
    where: { sharedExamId: officialExamId }
  });

  await prisma.sharedExamQuestion.createMany({
    data: questions.map((question, index) => ({
      id: `official_math_limits_seq${index + 1}`,
      sharedExamId: officialExamId,
      questionId: question.id,
      sortOrder: index + 1,
      questionSnapshot: {
        statement: question.statement,
        type: QuestionType.OPEN_ANSWER,
        difficulty: question.difficulty,
        sourceYear: 2026,
        sourceExam: "ExamInA Oficial - Límites"
      },
      solutionSnapshot: {
        finalAnswer: question.finalAnswer,
        explanation: question.explanation
      }
    }))
  });

  console.log(`Seeded official exam ${officialExamId} with ${questions.length} questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
