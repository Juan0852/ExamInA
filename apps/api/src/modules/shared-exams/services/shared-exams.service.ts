import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { CommunityVisibility, SharedExamStatus } from "@prisma/client";
import { AuthService } from "../../auth/services/auth.service";
import type { SharedExamsResponseDto, StartSharedExamResponseDto } from "../dtos/shared-exam-response.dto";
import { SharedExamMapper } from "../mappers/shared-exam.mapper";
import type { SharedExamsRepository } from "../repositories/shared-exams.repository";
import { NotificationsService } from "../../notifications/services/notifications.service";


export const SHARED_EXAMS_REPOSITORY = Symbol("SHARED_EXAMS_REPOSITORY");

@Injectable()
export class SharedExamsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(SHARED_EXAMS_REPOSITORY) private readonly sharedExamsRepository: SharedExamsRepository,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService
  ) {}


  async findPublished(input?: { subjectId?: string }): Promise<SharedExamsResponseDto> {
    const sharedExams = await this.sharedExamsRepository.findPublished(input);

    return {
      data: sharedExams.map(SharedExamMapper.toSummaryResponse),
      meta: {
        total: sharedExams.length
      },
      error: null
    };
  }

  async findMine(authorizationHeader: string | undefined): Promise<SharedExamsResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const sharedExams = await this.sharedExamsRepository.findMine(user.id);

    return {
      data: sharedExams.map(SharedExamMapper.toSummaryResponse),
      meta: {
        total: sharedExams.length
      },
      error: null
    };
  }

  async updateVisibility(
    sharedExamId: string,
    visibility: string,
    authorizationHeader: string | undefined
  ): Promise<any> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);

    if (visibility !== "PUBLIC" && visibility !== "PRIVATE" && visibility !== "FRIENDS_ONLY") {
      throw new BadRequestException("Valor de visibilidad inválido");
    }

    const prismaVisibility = visibility as CommunityVisibility;
    const prismaStatus = prismaVisibility === CommunityVisibility.PRIVATE ? SharedExamStatus.DRAFT : SharedExamStatus.PUBLISHED;

    const updated = await this.sharedExamsRepository.updateVisibility(
      sharedExamId,
      user.id,
      prismaVisibility,
      prismaStatus
    );

    if (prismaVisibility === CommunityVisibility.PUBLIC) {
      await this.notificationsService.createNotification(
        user.id,
        "EXAM_CREATED",
        "Examen compartido publicado",
        `Tu examen "${updated.title}" ya está disponible públicamente en la plataforma.`,
        { sharedExamId: updated.id }
      );
    }


    return {
      data: SharedExamMapper.toSummaryResponse(updated),
      meta: {},
      error: null
    };
  }

  async start(
    sharedExamId: string,
    authorizationHeader?: string
  ): Promise<StartSharedExamResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const sharedExam = await this.sharedExamsRepository.findPublishedById(sharedExamId);

    if (!sharedExam) {
      throw new NotFoundException("Shared exam not found.");
    }

    const result = await this.sharedExamsRepository.startForUser({
      sharedExam,
      userId: user.id
    });

    return {
      data: result,
      meta: {},
      error: null
    };
  }

  async create(
    input: {
      title: string;
      description?: string;
      visibility?: string;
      allowCloning?: boolean;
      questions: {
        questionId?: string;
        customQuestion?: {
          subjectId: string;
          topicId: string;
          statement: string;
          difficulty: string;
          finalAnswer: string;
          explanation: string;
        };
      }[];
    },
    authorizationHeader?: string
  ): Promise<any> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);

    let prismaVisibility: CommunityVisibility = CommunityVisibility.PRIVATE;
    if (input.visibility) {
      if (input.visibility !== "PUBLIC" && input.visibility !== "PRIVATE" && input.visibility !== "FRIENDS_ONLY") {
        throw new BadRequestException("Valor de visibilidad inválido");
      }
      prismaVisibility = input.visibility as CommunityVisibility;
    }

    const created = await this.sharedExamsRepository.create({
      ownerId: user.id,
      title: input.title,
      description: input.description,
      visibility: prismaVisibility,
      allowCloning: input.allowCloning,
      questions: input.questions
    });

    if (prismaVisibility === CommunityVisibility.PUBLIC) {
      await this.notificationsService.createNotification(
        user.id,
        "EXAM_CREATED",
        "Examen compartido publicado",
        `Tu examen "${created.title}" ya está disponible públicamente en la plataforma.`,
        { sharedExamId: created.id }
      );
    }

    return {
      data: SharedExamMapper.toSummaryResponse(created),
      meta: {},
      error: null
    };
  }
}

