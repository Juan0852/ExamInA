import { Body, Controller, Get, Headers, Inject, Post, Param } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  createCommunityPostRequestSchema,
  type CreateCommunityPostRequestDto
} from "../dtos/create-community-post-request.dto";
import { CommunityPostsService } from "../services/community-posts.service";
import { CommunityReactionType } from "@prisma/client";

@Controller("community/posts")
export class CommunityPostsController {
  constructor(
    @Inject(CommunityPostsService) private readonly communityPostsService: CommunityPostsService
  ) {}

  @Post()
  create(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body(new ZodValidationPipe(createCommunityPostRequestSchema))
    data: CreateCommunityPostRequestDto
  ) {
    return this.communityPostsService.create(authorizationHeader, data);
  }

  @Get("me")
  findMine(@Headers("authorization") authorizationHeader: string | undefined) {
    return this.communityPostsService.findMine(authorizationHeader);
  }

  @Get()
  findFeed() {
    return this.communityPostsService.findFeed();
  }

  @Post(":id/comments")
  addComment(
    @Param("id") postId: string,
    @Body() body: { content: string },
    @Headers("authorization") authorizationHeader: string | undefined
  ) {
    return this.communityPostsService.addComment(postId, authorizationHeader, body.content);
  }

  @Post(":id/reactions")
  toggleReaction(
    @Param("id") postId: string,
    @Body() body: { type: CommunityReactionType },
    @Headers("authorization") authorizationHeader: string | undefined
  ) {
    return this.communityPostsService.toggleReaction(postId, authorizationHeader, body.type);
  }
}

