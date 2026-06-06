import type { CommunityPostResponseDto } from "../dtos/community-post-response.dto";
import type { CommunityPostEntity } from "../entities/community-post.entity";

export class CommunityPostMapper {
  static toResponse(post: CommunityPostEntity): CommunityPostResponseDto {
    return {
      id: post.id,
      authorId: post.authorId,
      type: post.type,
      visibility: post.visibility,
      title: post.title,
      content: post.content,
      examSessionId: post.examSessionId,
      status: post.status,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: {
        id: post.author.id,
        displayName: post.author.displayName,
        photoUrl: post.author.photoUrl,
        profile: post.author.profile
      },
      commentsCount: post._count?.comments ?? 0,
      reactionsCount: post._count?.reactions ?? 0,
      sharedExamId: (post as any).sharedExamId ?? null,
      sharedExam: (post as any).sharedExam ?? undefined,
      examSession: (post as any).examSession ?? undefined,
      fileAssets: (post as any).fileAssets ?? undefined,
    };
  }
}
