import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { FindQuestionsQueryDto } from "../dtos/find-questions-query.dto";
import type { QuestionEntity } from "../entities/question.entity";
import type { QuestionsRepository } from "./questions.repository";

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findAll(filters: FindQuestionsQueryDto): Promise<QuestionEntity[]> {
    return this.prismaService.getClient().question.findMany({
      where: {
        subjectId: filters.subjectId,
        topicId: filters.topicId,
        difficulty: filters.difficulty,
        type: filters.type
      },
      orderBy: { createdAt: "desc" },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        keywords: {
          orderBy: { keyword: "asc" }
        }
      }
    });
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    return this.prismaService.getClient().question.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        solution: true,
        keywords: {
          orderBy: { keyword: "asc" }
        }
      }
    });
  }
}
