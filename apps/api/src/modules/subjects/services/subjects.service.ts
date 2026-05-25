import { Inject, Injectable } from "@nestjs/common";
import { SubjectMapper } from "../mappers/subject.mapper";
import type { SubjectsRepository } from "../repositories/subjects.repository";

export const SUBJECTS_REPOSITORY = Symbol("SUBJECTS_REPOSITORY");

@Injectable()
export class SubjectsService {
  constructor(
    @Inject(SUBJECTS_REPOSITORY) private readonly subjectsRepository: SubjectsRepository
  ) {}

  async findAll() {
    const subjects = await this.subjectsRepository.findAll();

    return {
      data: subjects.map(SubjectMapper.toResponse),
      meta: {
        total: subjects.length
      },
      error: null
    };
  }
}
