import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CommunityPostsController } from "./controllers/community-posts.controller";
import { PrismaCommunityPostsRepository } from "./repositories/prisma-community-posts.repository";
import {
  COMMUNITY_POSTS_REPOSITORY,
  CommunityPostsService
} from "./services/community-posts.service";

import { CommunityGateway } from "./gateways/community.gateway";

@Module({
  imports: [AuthModule, DatabaseModule, NotificationsModule],
  controllers: [CommunityPostsController],
  providers: [
    CommunityGateway,
    CommunityPostsService,
    {
      provide: COMMUNITY_POSTS_REPOSITORY,
      useClass: PrismaCommunityPostsRepository
    }
  ]
})
export class CommunityModule {}
