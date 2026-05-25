import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthProvider } from "../../../shared/providers/auth/auth-provider.interface";
import type { AuthResponseDto } from "../dtos/auth-response.dto";
import type { LoginRequestDto } from "../dtos/login-request.dto";
import type { RegisterRequestDto } from "../dtos/register-request.dto";
import type { AuthenticatedUserEntity } from "../entities/authenticated-user.entity";
import { AuthUserMapper } from "../mappers/auth-user.mapper";
import type { AuthRepository } from "../repositories/auth.repository";

export const AUTH_PROVIDER = Symbol("AUTH_PROVIDER");
export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: AuthProvider,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository
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
