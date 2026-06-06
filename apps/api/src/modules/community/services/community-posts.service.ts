import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { CreateCommunityPostRequestDto } from "../dtos/create-community-post-request.dto";
import { CommunityPostMapper } from "../mappers/community-post.mapper";
import type { CommunityPostsRepository } from "../repositories/community-posts.repository";
import { PrismaService } from "../../../shared/database/prisma.service";
import { NotificationsService } from "../../notifications/services/notifications.service";
import { CommunityReactionType } from "@prisma/client";


import { CommunityGateway } from "../gateways/community.gateway";

export const COMMUNITY_POSTS_REPOSITORY = Symbol("COMMUNITY_POSTS_REPOSITORY");

@Injectable()
export class CommunityPostsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(COMMUNITY_POSTS_REPOSITORY)
    private readonly communityPostsRepository: CommunityPostsRepository,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(CommunityGateway) private readonly communityGateway: CommunityGateway
  ) {}


  async create(authorizationHeader: string | undefined, data: CreateCommunityPostRequestDto) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const post = await this.communityPostsRepository.create(user.id, data);
    
    const responseData = CommunityPostMapper.toResponse(post);
    this.communityGateway.broadcastNewPost(responseData);

    return {
      data: responseData,
      meta: {},
      error: null
    };
  }

  async findFeed(authorizationHeader?: string, tab: string = "new") {
    // We pass userId to repository if filtering by friends/foryou
    let userId = null;
    if (authorizationHeader && (tab === "friends" || tab === "foryou")) {
      const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
      userId = user.id;
    }
    
    const posts = await this.communityPostsRepository.findFeed(tab, userId);

    return {
      data: posts.map(CommunityPostMapper.toResponse),
      meta: {
        total: posts.length
      },
      error: null
    };
  }

  async findMine(authorizationHeader: string | undefined) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const posts = await this.communityPostsRepository.findMine(user.id);

    return {
      data: posts.map(CommunityPostMapper.toResponse),
      meta: {
        total: posts.length
      },
      error: null
    };
  }

  async addComment(
    postId: string,
    authorizationHeader: string | undefined,
    content: string
  ): Promise<any> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);

    const post = await this.prismaService.getClient().communityPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundException("La publicación no existe.");
    }

    const comment = await this.prismaService.getClient().communityComment.create({
      data: {
        postId,
        authorId: user.id,
        content
      }
    });

    if (post.authorId !== user.id) {
      const commenterUsername = user.profile?.username || "estudiante";
      await this.notificationsService.createNotification(
        post.authorId,
        "POST_COMMENTED",
        "Nuevo comentario en tu publicación",
        `@${commenterUsername} comentó: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
        { postId, commentId: comment.id, authorId: post.authorId }
      );
    }

    return {
      data: comment,
      meta: {},
      error: null
    };
  }

  async toggleReaction(
    postId: string,
    authorizationHeader: string | undefined,
    type: CommunityReactionType
  ): Promise<any> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);

    const post = await this.prismaService.getClient().communityPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundException("La publicación no existe.");
    }

    const existingReaction = await this.prismaService.getClient().communityReaction.findFirst({
      where: {
        userId: user.id,
        postId,
        type
      }
    });

    if (existingReaction) {
      await this.prismaService.getClient().communityReaction.delete({
        where: { id: existingReaction.id }
      });
      return {
        data: { reacted: false },
        meta: {},
        error: null
      };
    }

    const reaction = await this.prismaService.getClient().communityReaction.create({
      data: {
        userId: user.id,
        postId,
        type
      }
    });

    if (post.authorId !== user.id) {
      const reactorUsername = user.profile?.username || "estudiante";
      await this.notificationsService.createNotification(
        post.authorId,
        "POST_LIKED",
        "Nueva reacción en tu publicación",
        `@${reactorUsername} reaccionó a tu publicación.`,
        { postId, reactionId: reaction.id, reactionType: type, authorId: post.authorId }
      );
    }

    return {
      data: { reacted: true },
      meta: {},
      error: null
    };
  }
}

