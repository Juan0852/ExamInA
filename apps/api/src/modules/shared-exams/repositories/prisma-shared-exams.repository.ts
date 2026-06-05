import { Inject, Injectable } from "@nestjs/common";
import { CommunityVisibility, ExamSessionMode, ExamSessionStatus, SharedExamStatus, SharedExamUsageStatus } from "@prisma/client";
import { PrismaService } from "../../../shared/database/prisma.service";
import type {
  SharedExamStartRecord,
  SharedExamSummaryRecord,
  SharedExamsRepository
} from "./shared-exams.repository";

@Injectable()
export class PrismaSharedExamsRepository implements SharedExamsRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findPublished(input?: { subjectId?: string }): Promise<SharedExamSummaryRecord[]> {
    return this.prismaService.getClient().sharedExam.findMany({
      where: {
        visibility: CommunityVisibility.PUBLIC,
        status: SharedExamStatus.PUBLISHED,
        ...(input?.subjectId
          ? {
              questions: {
                some: {
                  question: {
                    subjectId: input.subjectId
                  }
                }
              }
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
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

  async findPublishedById(sharedExamId: string): Promise<SharedExamStartRecord | null> {
    return this.prismaService.getClient().sharedExam.findFirst({
      where: {
        id: sharedExamId,
        visibility: CommunityVisibility.PUBLIC,
        status: SharedExamStatus.PUBLISHED
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          select: {
            questionId: true,
            sortOrder: true,
            questionSnapshot: true,
            solutionSnapshot: true
          }
        }
      }
    });
  }

  async startForUser(input: {
    sharedExam: SharedExamStartRecord;
    userId: string;
  }): Promise<{ examSessionId: string }> {
    const examSession = await this.prismaService.getClient().examSession.create({
      data: {
        userId: input.userId,
        title: input.sharedExam.title,
        mode: ExamSessionMode.MOCK_EXAM,
        status: ExamSessionStatus.IN_PROGRESS,
        durationLimitSeconds: 5400,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        questions: {
          create: input.sharedExam.questions.map((question) => ({
            question: {
              connect: {
                id: question.questionId
              }
            },
            sortOrder: question.sortOrder,
            questionSnapshot: question.questionSnapshot as any,
            solutionSnapshot: question.solutionSnapshot as any
          }))
        },
        sharedExamUsages: {
          create: {
            sharedExamId: input.sharedExam.id,
            userId: input.userId,
            status: SharedExamUsageStatus.STARTED,
            startedAt: new Date()
          }
        }
      },
      select: {
        id: true
      }
    });

    return {
      examSessionId: examSession.id
    };
  }

  async findMine(userId: string): Promise<SharedExamSummaryRecord[]> {
    return this.prismaService.getClient().sharedExam.findMany({
      where: {
        ownerId: userId
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
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

  async updateVisibility(
    sharedExamId: string,
    userId: string,
    visibility: CommunityVisibility,
    status: SharedExamStatus
  ): Promise<SharedExamSummaryRecord> {
    return this.prismaService.getClient().sharedExam.update({
      where: {
        id: sharedExamId,
        ownerId: userId
      },
      data: {
        visibility,
        status
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true
              }
            }
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

  async create(input: {
    ownerId: string;
    title: string;
    description?: string;
    visibility?: CommunityVisibility;
    allowCloning?: boolean;
    subjectId?: string;
    topicId?: string;
    topicName?: string;
    questions: {
      questionId?: string;
      customQuestion?: {
        subjectId: string;
        topicId: string;
        statement: string;
        difficulty: string;
        finalAnswer: string;
        explanation: string;
        fileAssetId?: string;
        imageUrl?: string;
      };
    }[];
  }): Promise<SharedExamSummaryRecord> {
    const prisma = this.prismaService.getClient();

    return prisma.$transaction(async (tx) => {
      // 1. Resolve Topic if topicName is provided
      let finalTopicId = input.topicId;
      if (!finalTopicId && input.topicName && input.subjectId) {
        const slug = input.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let topic = await tx.topic.findUnique({
          where: { subjectId_slug: { subjectId: input.subjectId, slug } }
        });
        if (!topic) {
          topic = await tx.topic.create({
            data: {
              subjectId: input.subjectId,
              name: input.topicName,
              slug
            }
          });
        }
        finalTopicId = topic.id;
      }

      // 2. Create the SharedExam
      const sharedExam = await tx.sharedExam.create({
        data: {
          ownerId: input.ownerId,
          subjectId: input.subjectId,
          topicId: finalTopicId,
          title: input.title,
          description: input.description,
          visibility: input.visibility ?? CommunityVisibility.PRIVATE,
          status: input.visibility === CommunityVisibility.PUBLIC ? SharedExamStatus.PUBLISHED : SharedExamStatus.DRAFT,
          allowCloning: input.allowCloning ?? true
        }
      });

      // 3. Map and create questions / connections
      for (let i = 0; i < input.questions.length; i++) {
        const qInput = input.questions[i];
        let qId = qInput.questionId;
        let questionSnapshot: any = {};
        let solutionSnapshot: any = {};

        if (qId) {
          // Fetch existing question to clone snapshot
          const existingQ = await tx.question.findUnique({
            where: { id: qId },
            include: { solution: true }
          });
          if (!existingQ) {
            throw new Error(`Question with ID ${qId} not found`);
          }
          questionSnapshot = {
            statement: existingQ.statement,
            type: existingQ.type,
            difficulty: existingQ.difficulty,
            sourceYear: existingQ.sourceYear,
            sourceExam: existingQ.sourceExam
          };
          solutionSnapshot = existingQ.solution
            ? {
                finalAnswer: existingQ.solution.finalAnswer,
                explanation: existingQ.solution.explanation
              }
            : null;
        } else if (qInput.customQuestion) {
          const custom = qInput.customQuestion;
          // Create new question in database
          const newQ = await tx.question.create({
            data: {
              subjectId: custom.subjectId,
              topicId: custom.topicId,
              statement: custom.statement,
              difficulty: custom.difficulty as any,
              type: "OPEN_ANSWER",
              solution: {
                create: {
                  finalAnswer: custom.finalAnswer,
                  explanation: custom.explanation,
                  gradingCriteria: {
                    maxScore: 10,
                    criteria: [
                      "Identifica correctamente la respuesta.",
                      "Aplica el procedimiento adecuado.",
                      "Justifica el resultado final con claridad."
                    ]
                  }
                }
              }
            }
          });
          qId = newQ.id;
          questionSnapshot = {
            statement: custom.statement,
            type: "OPEN_ANSWER",
            difficulty: custom.difficulty,
            sourceYear: new Date().getFullYear(),
            sourceExam: "Examen Creado por Usuario",
            imageUrl: custom.imageUrl
          };
          solutionSnapshot = {
            finalAnswer: custom.finalAnswer,
            explanation: custom.explanation
          };

          if (custom.fileAssetId) {
            await tx.fileAsset.update({
              where: { id: custom.fileAssetId },
              data: {
                ownerType: "QUESTION",
                ownerId: newQ.id,
                role: "QUESTION_IMAGE",
                status: "ACTIVE"
              }
            });
          }
        } else {
          throw new Error("Each question must have either questionId or customQuestion");
        }

        // Create SharedExamQuestion
        await tx.sharedExamQuestion.create({
          data: {
            sharedExamId: sharedExam.id,
            questionId: qId,
            sortOrder: i + 1,
            questionSnapshot,
            solutionSnapshot
          }
        });
      }

      // 3. Return the full summary record
      return tx.sharedExam.findUniqueOrThrow({
        where: { id: sharedExam.id },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              photoUrl: true,
              profile: {
                select: {
                  username: true
                }
              }
            }
          },
          _count: {
            select: {
              questions: true
            }
          }
        }
      });
    });
  }
}
