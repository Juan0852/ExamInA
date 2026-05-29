import { Inject, Injectable } from "@nestjs/common";
import type { AuthUser } from "../../../shared/providers/auth/auth-provider.interface";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";
import type { AuthRepository } from "./auth.repository";

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string): Promise<AuthenticatedUserEntity | null> {
    const user = await this.prismaService.getClient().user.findUnique({
      where: { firebaseUid },
      include: {
        profile: true,
        preferences: true,
        progress: true
      }
    });

    return user;
  }

  async findOrCreateFromAuthUser(authUser: AuthUser): Promise<AuthenticatedUserEntity> {
    const email = authUser.email ?? `${authUser.firebaseUid}@firebase.local`;
    const displayName = authUser.displayName ?? null;
    const photoUrl = authUser.photoUrl ?? null;

    const user = await this.prismaService.getClient().user.upsert({
      where: { firebaseUid: authUser.firebaseUid },
      update: {
        email,
        displayName,
        photoUrl
      },
      create: {
        firebaseUid: authUser.firebaseUid,
        email,
        displayName,
        photoUrl,
        profile: {
          create: {
            username: this.createUsername(email, authUser.firebaseUid)
          }
        },
        preferences: {
          create: {}
        },
        progress: {
          create: {}
        }
      },
      include: {
        profile: true,
        preferences: true,
        progress: true
      }
    });

    return user;
  }

  async updatePreferences(
    userId: string,
    data: {
      preferredSubjects?: string[];
      weeklyStudyHours?: string | null;
      referralSource?: string | null;
      onboardingCompleted?: boolean;
    }
  ): Promise<AuthenticatedUserEntity> {
    await this.prismaService.getClient().userPreferences.update({
      where: { userId },
      data: {
        preferredSubjects: data.preferredSubjects ? (data.preferredSubjects as any) : undefined,
        weeklyStudyHours: data.weeklyStudyHours !== undefined ? data.weeklyStudyHours : undefined,
        referralSource: data.referralSource !== undefined ? data.referralSource : undefined,
        onboardingCompleted: data.onboardingCompleted !== undefined ? data.onboardingCompleted : undefined,
      }
    });

    const user = await this.prismaService.getClient().user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        progress: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      username?: string;
      bio?: string;
      targetUniversity?: string;
      photoUrl?: string;
    }
  ): Promise<AuthenticatedUserEntity> {
    await this.prismaService.getClient().user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName !== undefined ? data.displayName : undefined,
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : undefined,
        profile: {
          update: {
            username: data.username !== undefined ? data.username : undefined,
            bio: data.bio !== undefined ? data.bio : undefined,
            targetUniversity: data.targetUniversity !== undefined ? data.targetUniversity : undefined
          }
        }
      }
    });

    const user = await this.prismaService.getClient().user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        progress: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
    const existingProfile = await this.prismaService.getClient().userProfile.findUnique({
      where: { username },
      select: { userId: true }
    });

    return !existingProfile || existingProfile.userId === currentUserId;
  }

  private createUsername(email: string, firebaseUid: string): string {
    const base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_") || "student";
    const suffix = firebaseUid.slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, "");

    return `${base}_${suffix}`;
  }

  async findFriends(userId: string): Promise<any[]> {
    const friendships = await this.prismaService.getClient().friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true,
                level: true,
                bio: true
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true,
                level: true,
                bio: true
              }
            }
          }
        }
      }
    });

    return friendships.map((f) => {
      const isRequesterMe = f.requesterId === userId;
      const friend = isRequesterMe ? f.receiver : f.requester;
      return {
        id: friend.id,
        displayName: friend.displayName,
        photoUrl: friend.photoUrl,
        username: friend.profile?.username ?? null,
        level: friend.profile?.level ?? 1,
        bio: friend.profile?.bio ?? null
      };
    });
  }
}

