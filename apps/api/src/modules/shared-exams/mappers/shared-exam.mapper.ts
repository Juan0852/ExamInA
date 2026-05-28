import type { SharedExamSummaryResponseDto } from "../dtos/shared-exam-response.dto";
import type { SharedExamSummaryRecord } from "../repositories/shared-exams.repository";

export class SharedExamMapper {
  static toSummaryResponse(sharedExam: SharedExamSummaryRecord): SharedExamSummaryResponseDto {
    return {
      id: sharedExam.id,
      title: sharedExam.title,
      description: sharedExam.description,
      visibility: sharedExam.visibility,
      status: sharedExam.status,
      questionCount: sharedExam._count.questions,
      owner: {
        id: sharedExam.owner.id,
        displayName: sharedExam.owner.displayName,
        photoUrl: sharedExam.owner.photoUrl,
        username: sharedExam.owner.profile?.username ?? null
      },
      createdAt: sharedExam.createdAt.toISOString()
    };
  }
}
