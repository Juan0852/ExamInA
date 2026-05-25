export interface TopicResponseDto {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  questionsCount: number;
  createdAt: string;
  subject?: {
    id: string;
    name: string;
    slug: string;
  };
}
