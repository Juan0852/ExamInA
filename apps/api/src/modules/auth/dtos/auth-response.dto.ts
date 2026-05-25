import type { AuthUserResponseDto } from "./auth-user-response.dto";

export interface AuthResponseDto {
  data: {
    user: AuthUserResponseDto;
    auth?: {
      idToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  meta: Record<string, never>;
  error: null;
}
