import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { CreateCommunityPostRequestDto } from "../dtos/create-community-post-request.dto";
import { CommunityPostMapper } from "../mappers/community-post.mapper";
import type { CommunityPostsRepository } from "../repositories/community-posts.repository";

export const COMMUNITY_POSTS_REPOSITORY = Symbol("COMMUNITY_POSTS_REPOSITORY");

@Injectable()
export class CommunityPostsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(COMMUNITY_POSTS_REPOSITORY)
    private readonly communityPostsRepository: CommunityPostsRepository
  ) {}

  async create(authorizationHeader: string | undefined, data: CreateCommunityPostRequestDto) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const post = await this.communityPostsRepository.create(user.id, data);

    return {
      data: CommunityPostMapper.toResponse(post),
      meta: {},
      error: null
    };
  }

  async findFeed() {
    const posts = await this.communityPostsRepository.findFeed();

    return {
      data: posts.map(CommunityPostMapper.toResponse),
      meta: {
        total: posts.length
      },
      error: null
    };
  }
}
