import type { CreateCommunityPostRequestDto } from "../dtos/create-community-post-request.dto";
import type { CommunityPostEntity } from "../entities/community-post.entity";

export interface CommunityPostsRepository {
  create(authorId: string, data: CreateCommunityPostRequestDto): Promise<CommunityPostEntity>;
  findFeed(): Promise<CommunityPostEntity[]>;
}
