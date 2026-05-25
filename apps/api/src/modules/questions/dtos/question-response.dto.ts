export interface QuestionResponseDto {
  id: string;
  subjectId: string;
  topicId: string;
  statement: string;
  type: string;
  difficulty: string;
  sourceYear: number | null;
  sourceExam: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
    slug: string;
  };
  topic?: {
    id: string;
    name: string;
    slug: string;
  };
  solution?: {
    id: string;
    finalAnswer: string;
    explanation: string;
    gradingCriteria: unknown;
  } | null;
  keywords?: string[];
}
