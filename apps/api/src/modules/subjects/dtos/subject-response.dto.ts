export interface SubjectResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  topicsCount: number;
  questionsCount: number;
  createdAt: string;
}
