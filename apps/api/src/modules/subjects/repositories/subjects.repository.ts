import type { SubjectEntity } from "../entities/subject.entity";

export interface SubjectsRepository {
  findAll(): Promise<SubjectEntity[]>;
}
