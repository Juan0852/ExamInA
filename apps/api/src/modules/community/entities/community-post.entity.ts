export interface CommunityPostEntity {
  id: string;
  authorId: string;
  type: string;
  visibility: string;
  title: string | null;
  content: string;
  examSessionId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    displayName: string | null;
    photoUrl: string | null;
    profile: {
      username: string;
      level: number;
    } | null;
  };
  _count?: {
    comments: number;
    reactions: number;
  };
}
