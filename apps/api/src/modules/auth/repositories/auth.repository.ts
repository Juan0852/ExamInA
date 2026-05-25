import type { AuthUser } from "../../../shared/providers/auth/auth-provider.interface";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";

export interface AuthRepository {
  findByFirebaseUid(firebaseUid: string): Promise<AuthenticatedUserEntity | null>;
  findOrCreateFromAuthUser(authUser: AuthUser): Promise<AuthenticatedUserEntity>;
}
