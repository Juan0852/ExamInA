import { Controller, Get, Patch, Post, Delete, Param, Headers, Inject, forwardRef } from "@nestjs/common";
import { NotificationsService } from "../services/notifications.service";
import { AuthService } from "../../auth/services/auth.service";

@Controller("notifications")
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Get()
  async getNotifications(@Headers("authorization") authorizationHeader?: string) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const notifications = await this.notificationsService.findUserNotifications(user.id);
    return {
      data: notifications,
      meta: {
        total: notifications.length,
        unread: notifications.filter((n: any) => !n.read).length,
      },
      error: null,
    };
  }

  @Patch(":id/read")
  async markAsRead(
    @Param("id") id: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    await this.notificationsService.markAsRead(user.id, id);
    return {
      data: { success: true },
      meta: {},
      error: null,
    };
  }

  @Post("read-all")
  async markAllAsRead(@Headers("authorization") authorizationHeader?: string) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    await this.notificationsService.markAllAsRead(user.id);
    return {
      data: { success: true },
      meta: {},
      error: null,
    };
  }

  @Delete("clear")
  async clearAll(@Headers("authorization") authorizationHeader?: string) {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    await this.notificationsService.clearAll(user.id);
    return {
      data: { success: true },
      meta: {},
      error: null,
    };
  }
}
