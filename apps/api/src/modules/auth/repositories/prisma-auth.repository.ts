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
        preferences: true
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
        }
      },
      include: {
        profile: true,
        preferences: true
      }
    });

    return user;
  }

  private createUsername(email: string, firebaseUid: string): string {
    const base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_") || "student";
    const suffix = firebaseUid.slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, "");

    return `${base}_${suffix}`;
  }
}
