export type WrittenAnswerPromptInput = {
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  imageUrls?: string[];
};

export function buildWrittenAnswerCorrectionMessages(input: WrittenAnswerPromptInput) {
  const textContent = JSON.stringify({
    task: "Evalua la respuesta escrita del estudiante.",
    rules: {
      score: "Numero entre 0 y 10.",
      isCorrect: "true si score >= 5.",
      summary: "Maximo 120 caracteres.",
      feedback: "Feedback claro, util y accionable. Al final de tu feedback, incluye SIEMPRE una seccion titulada '### Resolucion Paso a Paso' explicando brevemente y a grandes rasgos como resolver el ejercicio paso a paso de forma correcta.",
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
  });

  const hasImages = input.imageUrls && input.imageUrls.length > 0;

  return [
    {
      role: "system",
      content:
        "Eres un corrector academico de ExamInA. Corrige respuestas de estudiantes de forma estricta pero pedagogica. Tienes la capacidad de analizar imagenes adjuntas (fotografias o dibujos) si el estudiante las provee como parte de su solucion. Evalua el texto junto con las imagenes. Devuelve solo JSON valido, sin markdown."
    },
    {
      role: "user",
      content: hasImages
        ? [
            { type: "text", text: textContent },
            ...input.imageUrls!.map((url) => ({
              type: "image_url",
              image_url: { url }
            }))
          ]
        : textContent
    }
  ];
}
