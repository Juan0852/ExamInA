import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import { NotificationType } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    metadata?: any
  ) {
    return this.prismaService.getClient().notification.create({
      data: {
        userId,
        type,
        title,
        content,
        metadata: metadata || undefined,
      },
    });
  }

  async findUserNotifications(userId: string) {
    return this.prismaService.getClient().notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(userId: string, id: string) {
    return this.prismaService.getClient().notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prismaService.getClient().notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async clearAll(userId: string) {
    return this.prismaService.getClient().notification.deleteMany({
      where: { userId },
    });
  }
}
