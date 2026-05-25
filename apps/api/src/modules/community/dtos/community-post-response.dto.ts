export interface CommunityPostResponseDto {
  id: string;
  authorId: string;
  type: string;
  visibility: string;
  title: string | null;
  content: string;
  examSessionId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    displayName: string | null;
    photoUrl: string | null;
    profile: {
      username: string;
      level: number;
    } | null;
  };
  commentsCount: number;
  reactionsCount: number;
}
