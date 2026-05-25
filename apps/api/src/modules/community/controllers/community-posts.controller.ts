import { Body, Controller, Get, Headers, Inject, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  createCommunityPostRequestSchema,
  type CreateCommunityPostRequestDto
} from "../dtos/create-community-post-request.dto";
import { CommunityPostsService } from "../services/community-posts.service";

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

  @Get()
  findFeed() {
    return this.communityPostsService.findFeed();
  }
}
