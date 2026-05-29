import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { NotificationsController } from "./controllers/notifications.controller";
import { NotificationsService } from "./services/notifications.service";

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
