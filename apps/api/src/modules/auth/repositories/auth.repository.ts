import type { AuthUser } from "../../../shared/providers/auth/auth-provider.interface";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";

export interface AuthRepository {
  findByFirebaseUid(firebaseUid: string): Promise<AuthenticatedUserEntity | null>;
  findOrCreateFromAuthUser(authUser: AuthUser): Promise<AuthenticatedUserEntity>;
  updatePreferences(
    userId: string,
    data: {
      preferredSubjects?: string[];
      weeklyStudyHours?: string | null;
      referralSource?: string | null;
      onboardingCompleted?: boolean;
    }
  ): Promise<AuthenticatedUserEntity>;
  updateProfile(
    userId: string,
    data: {
      displayName?: string;
      username?: string;
      bio?: string;
      targetUniversity?: string;
      photoUrl?: string;
    }
  ): Promise<AuthenticatedUserEntity>;
  isUsernameAvailable(username: string, currentUserId: string): Promise<boolean>;
}
