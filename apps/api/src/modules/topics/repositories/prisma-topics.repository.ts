import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { FindTopicsQueryDto } from "../dtos/find-topics-query.dto";
import type { TopicEntity } from "../entities/topic.entity";
import type { TopicsRepository } from "./topics.repository";

@Injectable()
export class PrismaTopicsRepository implements TopicsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findAll(filters: FindTopicsQueryDto): Promise<TopicEntity[]> {
    return this.prismaService.getClient().topic.findMany({
      where: {
        subjectId: filters.subjectId
      },
      orderBy: [{ subjectId: "asc" }, { name: "asc" }],
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });
  }
}
