export interface QuestionEntity {
  id: string;
  subjectId: string;
  topicId: string;
  statement: string;
  type: string;
  difficulty: string;
  sourceYear: number | null;
  sourceExam: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  keywords?: {
    id: string;
    keyword: string;
  }[];
  attempts?: {
    id: string;
    score: number | null;
    status: string;
  }[];
}
