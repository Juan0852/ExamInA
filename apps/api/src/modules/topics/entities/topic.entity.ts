export interface TopicEntity {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  createdAt: Date;
  subject?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    questions: number;
  };
}
