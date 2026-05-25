import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { SubjectEntity } from "../entities/subject.entity";
import type { SubjectsRepository } from "./subjects.repository";

@Injectable()
export class PrismaSubjectsRepository implements SubjectsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findAll(): Promise<SubjectEntity[]> {
    return this.prismaService.getClient().subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            topics: true,
            questions: true
          }
        }
      }
    });
  }
}
