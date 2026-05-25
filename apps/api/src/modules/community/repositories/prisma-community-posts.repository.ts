import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { CreateCommunityPostRequestDto } from "../dtos/create-community-post-request.dto";
import type { CommunityPostEntity } from "../entities/community-post.entity";
import type { CommunityPostsRepository } from "./community-posts.repository";

const postInclude = {
  author: {
    select: {
      id: true,
      displayName: true,
      photoUrl: true,
      profile: {
        select: {
          username: true,
          level: true
        }
      }
    }
  },
  _count: {
    select: {
      comments: true,
      reactions: true
    }
  }
} as const;

@Injectable()
export class PrismaCommunityPostsRepository implements CommunityPostsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async create(
    authorId: string,
    data: CreateCommunityPostRequestDto
  ): Promise<CommunityPostEntity> {
    return this.prismaService.getClient().communityPost.create({
      data: {
        authorId,
        type: data.type,
        visibility: data.visibility,
        title: data.title,
        content: data.content,
        examSessionId: data.examSessionId
      },
      include: postInclude
    });
  }

  async findFeed(): Promise<CommunityPostEntity[]> {
    return this.prismaService.getClient().communityPost.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC"
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: postInclude
    });
  }
}
