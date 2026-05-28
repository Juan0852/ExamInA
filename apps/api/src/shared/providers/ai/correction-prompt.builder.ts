export type WrittenAnswerPromptInput = {
  question: string;
  expectedAnswer: string;
  userAnswer: string;
};

export function buildWrittenAnswerCorrectionMessages(input: WrittenAnswerPromptInput) {
  return [
    {
      role: "system",
      content:
        "Eres un corrector academico de ExamInA. Corrige respuestas de estudiantes de forma estricta pero pedagogica. Devuelve solo JSON valido, sin markdown."
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Evalua la respuesta escrita del estudiante.",
        rules: {
          score: "Numero entre 0 y 10.",
          isCorrect: "true si score >= 5.",
          summary: "Maximo 120 caracteres.",
          feedback: "Feedback claro, util y accionable.",
          detectedErrors: "Array de errores concretos.",
          missingKeywords: "Array de conceptos clave ausentes.",
          suggestions: "Array de recomendaciones cortas.",
          recommendedTopics: "Array de temas a repasar.",
          jsonValidity: "No uses markdown. No uses barras invertidas salvo escapes JSON validos como \\\" o \\n."
        },
        expectedJsonShape: {
          score: 0,
          isCorrect: false,
          summary: "",
          feedback: "",
          detectedErrors: [],
          missingKeywords: [],
          suggestions: [],
          recommendedTopics: []
        },
        question: input.question,
        expectedAnswer: input.expectedAnswer,
        userAnswer: input.userAnswer
      })
    }
  ];
}
