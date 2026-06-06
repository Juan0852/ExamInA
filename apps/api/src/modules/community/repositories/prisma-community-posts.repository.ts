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
  },
  sharedExam: {
    select: {
      id: true,
      title: true,
      description: true
    }
  },
  examSession: {
    select: {
      id: true,
      title: true,
      totalScore: true,
      maxScore: true
    }
  }
} as const;

@Injectable()
export class PrismaCommunityPostsRepository implements CommunityPostsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async create(
    authorId: string,
    data: CreateCommunityPostRequestDto
  ): Promise<any> {
    const post = await this.prismaService.getClient().communityPost.create({
      data: {
        authorId,
        type: data.type,
        visibility: data.visibility,
        title: data.title,
        content: data.content,
        examSessionId: data.examSessionId,
        sharedExamId: data.sharedExamId,
      },
      include: postInclude
    });

    if (data.imageKeys && data.imageKeys.length > 0) {
      await this.prismaService.getClient().fileAsset.updateMany({
        where: {
          id: { in: data.imageKeys },
          userId: authorId
        },
        data: {
          ownerType: "COMMUNITY_POST",
          ownerId: post.id,
          role: "POST_IMAGE"
        }
      });
    }

    // Fetch the updated post with file assets since we just updated them
    return this.prismaService.getClient().communityPost.findUnique({
      where: { id: post.id },
      include: postInclude // In Prisma, FileAsset relation needs to be fetched manually or by adding it to include. 
      // But we can't easily add FileAsset back-relation to CommunityPost because it's a polymorphic relation (ownerId/ownerType).
    });
  }

  async findFeed(tab: string = "new", userId: string | null = null): Promise<any[]> {
    let whereClause: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC"
    };

    if (tab === "friends" && userId) {
      // Mocked for now: Just show all public posts, or simulate filtering.
      // In reality, we'd fetch friendships where status=ACCEPTED and filter by those authorIds.
      // whereClause.authorId = { in: friendIds }
      // For now, we will just return normal feed but maybe order differently to mock it.
    }

    const posts = await this.prismaService.getClient().communityPost.findMany({
      where: whereClause,
      orderBy: tab === "foryou" ? { _count: { reactions: "desc" } } : { createdAt: "desc" },
      take: 50,
      include: postInclude
    });

    // We must attach FileAssets manually because it's a polymorphic relation
    const postIds = posts.map(p => p.id);
    const assets = await this.prismaService.getClient().fileAsset.findMany({
      where: {
        ownerType: "COMMUNITY_POST",
        ownerId: { in: postIds },
        role: "POST_IMAGE",
        status: "ACTIVE"
      }
    });

    return posts.map(post => ({
      ...post,
      fileAssets: assets.filter(a => a.ownerId === post.id)
    }));
  }

  async findMine(authorId: string): Promise<CommunityPostEntity[]> {
    return this.prismaService.getClient().communityPost.findMany({
      where: {
        authorId
      },
      orderBy: { createdAt: "desc" },
      include: postInclude
    });
  }
}

