import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { FindQuestionsQueryDto } from "../dtos/find-questions-query.dto";
import { QuestionMapper } from "../mappers/question.mapper";
import type { QuestionsRepository } from "../repositories/questions.repository";
import { AuthService } from "../../auth/services/auth.service";
import { getLlmProviderConfig } from "../../../shared/providers/ai/llm-provider.config";

export const QUESTIONS_REPOSITORY = Symbol("QUESTIONS_REPOSITORY");

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(QUESTIONS_REPOSITORY) private readonly questionsRepository: QuestionsRepository
  ) {}

  async findAll(authorizationHeader: string | undefined, filters: FindQuestionsQueryDto) {
    let userId: string | undefined;
    if (authorizationHeader) {
      try {
        const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
        userId = user.id;
      } catch {
        // Ignore token errors and return anonymous listing
      }
    }
    const questions = await this.questionsRepository.findAll(filters, userId);

    return {
      data: questions.map(QuestionMapper.toResponse),
      meta: {
        total: questions.length
      },
      error: null
    };
  }

  async findById(id: string) {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new NotFoundException("Question was not found.");
    }

    return {
      data: QuestionMapper.toResponse(question),
      meta: {},
      error: null
    };
  }

  async generateAi(
    input: {
      prompt: string;
      subjectId?: string;
      topicId?: string;
      difficulty?: string;
    },
    authorizationHeader: string | undefined
  ): Promise<any> {
    await this.authService.resolveAuthenticatedUser(authorizationHeader);

    const config = getLlmProviderConfig();

    if (config.provider === "mock") {
      return {
        data: {
          statement: `Calcula el límite $$\\lim_{x \\to 0} \\frac{\\sin(3x) \\cdot (e^{x} - 1)}{x^2}$$ utilizando equivalencias infinitesimales o límites notables. Justifica los pasos.`,
          difficulty: input.difficulty || "MEDIUM",
          finalAnswer: "\\(3\\)",
          explanation: "Cuando \\(x \\to 0\\), tenemos las siguientes equivalencias infinitesimales:\n1) \\(\\sin(3x) \\sim 3x\\)\n2) \\(e^{x} - 1 \\sim x\\)\n\nSustituyendo en la expresión del límite:\n$$\\lim_{x \\to 0} \\frac{3x \\cdot x}{x^2} = \\lim_{x \\to 0} \\frac{3x^2}{x^2} = 3$$\n\nPor tanto, el resultado es 3.",
          expectedKeywords: ["equivalencias infinitesimales", "límite notable", "resultado 3"]
        },
        meta: {},
        error: null
      };
    }

    const systemPrompt = `Eres un profesor de bachillerato preparando exámenes oficiales de Selectividad (PAU) en España.
Tu tarea es generar una pregunta de examen de alta calidad con su solución exacta y explicación paso a paso basándote en la sugerencia del usuario.
Debes responder obligatoriamente con un único objeto JSON que tenga los siguientes campos exactos:
{
  "statement": "El enunciado de la pregunta. Usa $$ para ecuaciones matemáticas destacadas en bloque y \\( y \\) para fórmulas o expresiones matemáticas en línea.",
  "difficulty": "EASY" | "MEDIUM" | "HARD" (selecciona la dificultad adecuada),
  "finalAnswer": "La respuesta final corta y resumida (ej. \\( 4 \\) o \\( x = 1 \\)). Usa LaTeX en línea.",
  "explanation": "La justificación o procedimiento paso a paso para resolver el problema, explicada de forma clara y didáctica. Usa LaTeX si es necesario.",
  "expectedKeywords": ["Lista de 3 a 8 palabras o conceptos clave esperados en una buena respuesta"]
}

No incluyas explicaciones previas ni posteriores, solo devuelve el objeto JSON válido.`;

    const userPrompt = `Sugerencia/Instrucciones del usuario: "${input.prompt}"
${input.difficulty ? `Dificultad deseada: ${input.difficulty}` : ""}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const body: Record<string, unknown> = {
      model: config.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    };

    if (config.provider === "openai") {
      body.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM generation failed: ${response.statusText} - ${errorText}`);
      }

      const payload = (await response.json()) as any;
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("El LLM devolvió una respuesta vacía.");
      }

      let parsed: any;
      const sanitizeJsonString = (str: string) => str.replace(/\\(?!(?:"|n(?![a-zA-Z])))/g, "\\\\");

      try {
        parsed = JSON.parse(sanitizeJsonString(content.trim()));
      } catch (parseErr) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(sanitizeJsonString(jsonMatch[0].trim()));
          } catch (matchErr) {
            parsed = JSON.parse(jsonMatch[0].trim());
          }
        } else {
          throw new Error("No se pudo parsear la respuesta como JSON válido.");
        }
      }

      return {
        data: {
          statement: parsed.statement || "Pregunta sin enunciado generado.",
          difficulty: parsed.difficulty || "MEDIUM",
          finalAnswer: parsed.finalAnswer || "",
          explanation: parsed.explanation || "",
          expectedKeywords: Array.isArray(parsed.expectedKeywords)
            ? parsed.expectedKeywords.map((keyword: unknown) => String(keyword)).filter(Boolean)
            : []
        },
        meta: {},
        error: null
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error(error instanceof Error ? error.message : "Error durante la generación con IA.");
    }
  }
}
