export interface SubjectEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    topics: number;
    questions: number;
  };
}
