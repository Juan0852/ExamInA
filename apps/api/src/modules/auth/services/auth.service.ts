import { ConflictException, Inject, Injectable, UnauthorizedException, NotFoundException, BadRequestException, forwardRef } from "@nestjs/common";
import type { AuthProvider } from "../../../shared/providers/auth/auth-provider.interface";
import type { AuthResponseDto } from "../dtos/auth-response.dto";
import type { GoogleAuthRequestDto } from "../dtos/google-auth-request.dto";
import type { LoginRequestDto } from "../dtos/login-request.dto";
import type { RegisterRequestDto } from "../dtos/register-request.dto";
import type { UpdateProfileRequestDto } from "../dtos/update-profile-request.dto";
import type { CompleteOnboardingRequestDto } from "../dtos/complete-onboarding-request.dto";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";
import { AuthUserMapper } from "../mappers/auth-user.mapper";
import type { AuthRepository } from "../repositories/auth.repository";
import { PrismaService } from "../../../shared/database/prisma.service";
import { NotificationsService } from "../../notifications/services/notifications.service";

export const AUTH_PROVIDER = Symbol("AUTH_PROVIDER");
export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: AuthProvider,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService
  ) {}

  async register(credentials: RegisterRequestDto): Promise<AuthResponseDto> {
    const registerResult = await this.authProvider.registerWithEmailAndPassword(
      credentials.email,
      credentials.password,
      credentials.displayName
    );
    const user = await this.authRepository.findOrCreateFromAuthUser(registerResult.user);

    return this.createAuthResponse(
      user,
      registerResult.idToken,
      registerResult.refreshToken,
      registerResult.expiresIn
    );
  }

  async login(credentials: LoginRequestDto): Promise<AuthResponseDto> {
    const loginResult = await this.authProvider.signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    );
    const user = await this.authRepository.findOrCreateFromAuthUser(loginResult.user);

    return this.createAuthResponse(
      user,
      loginResult.idToken,
      loginResult.refreshToken,
      loginResult.expiresIn
    );
  }

  async loginWithGoogle(credentials: GoogleAuthRequestDto): Promise<AuthResponseDto> {
    const loginResult = await this.authProvider.signInWithGoogleIdToken(credentials.idToken);
    const user = await this.authRepository.findOrCreateFromAuthUser(loginResult.user);

    return this.createAuthResponse(
      user,
      loginResult.idToken,
      loginResult.refreshToken,
      loginResult.expiresIn
    );
  }

  async createSession(authorizationHeader?: string): Promise<AuthResponseDto> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);

    return {
      data: {
        user: AuthUserMapper.toResponse(user)
      },
      meta: {},
      error: null
    };
  }

  async resolveAuthenticatedUser(authorizationHeader?: string): Promise<AuthenticatedUserEntity> {
    const token = this.extractBearerToken(authorizationHeader);
    const authUser = await this.authProvider.verifyToken(token);
    return this.authRepository.findOrCreateFromAuthUser(authUser);
  }

  async getMe(authorizationHeader?: string): Promise<AuthResponseDto> {
    return this.createSession(authorizationHeader);
  }

  async updatePreferences(
    preferencesData: {
      preferredSubjects?: string[];
      weeklyStudyHours?: string | null;
      referralSource?: string | null;
      onboardingCompleted?: boolean;
    },
    authorizationHeader?: string
  ): Promise<AuthResponseDto> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);
    const updatedUser = await this.authRepository.updatePreferences(user.id, preferencesData);

    return {
      data: {
        user: AuthUserMapper.toResponse(updatedUser)
      },
      meta: {},
      error: null
    };
  }

  async completeOnboarding(
    onboardingData: CompleteOnboardingRequestDto,
    authorizationHeader?: string
  ): Promise<AuthResponseDto> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);
    
    if (onboardingData.username) {
      const isUsernameAvailable = await this.authRepository.isUsernameAvailable(
        onboardingData.username,
        user.id
      );
      if (!isUsernameAvailable) {
        throw new ConflictException("El nombre de usuario ya está en uso.");
      }
    }

    const updatedUser = await this.authRepository.completeOnboarding(user.id, onboardingData);

    return {
      data: {
        user: AuthUserMapper.toResponse(updatedUser)
      },
      meta: {},
      error: null
    };
  }

  async updateProfile(
    profileData: UpdateProfileRequestDto,
    authorizationHeader?: string
  ): Promise<AuthResponseDto> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);
    if (profileData.username) {
      const isUsernameAvailable = await this.authRepository.isUsernameAvailable(
        profileData.username,
        user.id
      );

      if (!isUsernameAvailable) {
        throw new ConflictException("Ese nombre público ya está siendo utilizado por alguien más.");
      }
    }

    const updatedUser = await this.authRepository.updateProfile(user.id, {
      displayName: profileData.displayName,
      username: profileData.username,
      bio: profileData.bio,
      targetUniversity: profileData.targetUniversity,
      photoUrl: profileData.photoUrl || undefined
    });

    return {
      data: {
        user: AuthUserMapper.toResponse(updatedUser)
      },
      meta: {},
      error: null
    };
  }

  async checkUsernameAvailability(
    username: string,
    authorizationHeader?: string
  ): Promise<{ data: { available: boolean }; meta: {}; error: null }> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);
    const normalizedUsername = username.trim().toLowerCase();
    const available = await this.authRepository.isUsernameAvailable(normalizedUsername, user.id);

    return {
      data: {
        available
      },
      meta: {},
      error: null
    };
  }

  private createAuthResponse(
    user: Awaited<ReturnType<AuthRepository["findOrCreateFromAuthUser"]>>,
    idToken: string,
    refreshToken: string,
    expiresIn: number
  ): AuthResponseDto {
    return {
      data: {
        user: AuthUserMapper.toResponse(user),
        auth: {
          idToken,
          refreshToken,
          expiresIn
        }
      },
      meta: {},
      error: null
    };
  }

  async findFriends(authorizationHeader: string | undefined): Promise<{ data: any[]; meta: {}; error: null }> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);
    const friends = await this.authRepository.findFriends(user.id);

    return {
      data: friends,
      meta: {},
      error: null
    };
  }

  async sendFriendRequest(
    authorizationHeader: string | undefined,
    friendUsername: string
  ): Promise<any> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);

    const friendProfile = await this.prismaService.getClient().userProfile.findUnique({
      where: { username: friendUsername.trim().toLowerCase() },
      include: { user: true }
    });

    if (!friendProfile) {
      throw new NotFoundException("El usuario destino no existe.");
    }

    const friend = friendProfile.user;

    if (user.id === friend.id) {
      throw new BadRequestException("No puedes enviarte una solicitud de amistad a ti mismo.");
    }

    const existingFriendship = await this.prismaService.getClient().friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, receiverId: friend.id },
          { requesterId: friend.id, receiverId: user.id }
        ]
      }
    });

    if (existingFriendship) {
      throw new BadRequestException("Ya existe una solicitud o amistad con este usuario.");
    }

    const friendship = await this.prismaService.getClient().friendship.create({
      data: {
        requesterId: user.id,
        receiverId: friend.id,
        status: "PENDING"
      }
    });

    const requesterUsername = user.profile?.username || "estudiante";
    await this.notificationsService.createNotification(
      friend.id,
      "FRIEND_REQUEST",
      "Solicitud de amistad recibida",
      `@${requesterUsername} te ha enviado una solicitud de amistad.`,
      { requesterId: user.id, requesterUsername, friendshipId: friendship.id }
    );

    return {
      data: friendship,
      meta: {},
      error: null
    };
  }

  async respondFriendRequest(
    authorizationHeader: string | undefined,
    friendshipId: string,
    action: "ACCEPT" | "REJECT"
  ): Promise<any> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);

    const friendship = await this.prismaService.getClient().friendship.findUnique({
      where: { id: friendshipId },
      include: { requester: { include: { profile: true } } }
    });

    if (!friendship || friendship.receiverId !== user.id) {
      throw new NotFoundException("Solicitud de amistad no encontrada.");
    }

    if (action === "ACCEPT") {
      await this.prismaService.getClient().friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" }
      });

      const receiverUsername = user.profile?.username || "estudiante";
      await this.notificationsService.createNotification(
        friendship.requesterId,
        "FRIEND_REQUEST",
        "Solicitud de amistad aceptada",
        `@${receiverUsername} ha aceptado tu solicitud de amistad.`,
        { receiverId: user.id, receiverUsername }
      );
    } else {
      await this.prismaService.getClient().friendship.delete({
        where: { id: friendshipId }
      });
    }

    return {
      data: { success: true },
      meta: {},
      error: null
    };
  }

  async findPendingFriendRequests(authorizationHeader: string | undefined): Promise<any> {
    const user = await this.resolveAuthenticatedUser(authorizationHeader);

    const pending = await this.prismaService.getClient().friendship.findMany({
      where: { receiverId: user.id, status: "PENDING" },
      include: {
        requester: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
            profile: {
              select: {
                username: true,
                level: true
              }
            }
          }
        }
      }
    });

    return {
      data: pending.map((p) => ({
        friendshipId: p.id,
        id: p.requester.id,
        displayName: p.requester.displayName,
        photoUrl: p.requester.photoUrl,
        username: p.requester.profile?.username ?? null,
        level: p.requester.profile?.level ?? 1
      })),
      meta: {
        total: pending.length
      },
      error: null
    };
  }


  private extractBearerToken(authorizationHeader?: string): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException("Missing Authorization header.");
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Authorization header must use Bearer token.");
    }

    return token;
  }
}
