import { Body, Controller, Get, Headers, Inject, Post, Put, Query } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import { googleAuthRequestSchema, type GoogleAuthRequestDto } from "../dtos/google-auth-request.dto";
import { loginRequestSchema, type LoginRequestDto } from "../dtos/login-request.dto";
import { registerRequestSchema, type RegisterRequestDto } from "../dtos/register-request.dto";
import { updateProfileRequestSchema, type UpdateProfileRequestDto } from "../dtos/update-profile-request.dto";
import { completeOnboardingRequestSchema, type CompleteOnboardingRequestDto } from "../dtos/complete-onboarding-request.dto";
import { AuthService } from "../services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("register")
  register(@Body(new ZodValidationPipe(registerRequestSchema)) credentials: RegisterRequestDto) {
    return this.authService.register(credentials);
  }

  @Post("login")
  login(@Body(new ZodValidationPipe(loginRequestSchema)) credentials: LoginRequestDto) {
    return this.authService.login(credentials);
  }

  @Post("google")
  googleLogin(@Body(new ZodValidationPipe(googleAuthRequestSchema)) credentials: GoogleAuthRequestDto) {
    return this.authService.loginWithGoogle(credentials);
  }

  @Post("session")
  createSession(@Headers("authorization") authorizationHeader?: string) {
    return this.authService.createSession(authorizationHeader);
  }

  @Get("me")
  getMe(@Headers("authorization") authorizationHeader?: string) {
    return this.authService.getMe(authorizationHeader);
  }

  @Get("profile/username-availability")
  checkUsernameAvailability(
    @Query("username") username = "",
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.checkUsernameAvailability(username, authorizationHeader);
  }

  @Put("preferences")
  updatePreferences(
    @Body() preferencesDto: {
      preferredSubjects?: string[];
      weeklyStudyHours?: string | null;
      referralSource?: string | null;
      onboardingCompleted?: boolean;
    },
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.updatePreferences(preferencesDto, authorizationHeader);
  }

  @Post("onboarding/complete")
  completeOnboarding(
    @Body(new ZodValidationPipe(completeOnboardingRequestSchema)) onboardingDto: CompleteOnboardingRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.completeOnboarding(onboardingDto, authorizationHeader);
  }

  @Get("friends")
  getFriends(@Headers("authorization") authorizationHeader?: string) {
    return this.authService.findFriends(authorizationHeader);
  }

  @Post("friends/request")
  sendFriendRequest(
    @Body() body: { friendUsername: string },
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.sendFriendRequest(authorizationHeader, body.friendUsername);
  }

  @Post("friends/respond")
  respondFriendRequest(
    @Body() body: { friendshipId: string; action: "ACCEPT" | "REJECT" },
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.respondFriendRequest(authorizationHeader, body.friendshipId, body.action);
  }

  @Get("friends/pending")
  getPendingFriendRequests(@Headers("authorization") authorizationHeader?: string) {
    return this.authService.findPendingFriendRequests(authorizationHeader);
  }

  @Put("profile")
  updateProfile(
    @Body(new ZodValidationPipe(updateProfileRequestSchema)) profileDto: UpdateProfileRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.authService.updateProfile(profileDto, authorizationHeader);
  }
}
