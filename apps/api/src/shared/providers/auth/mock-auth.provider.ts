import type { AuthProvider, AuthUser } from "./auth-provider.interface";

export class MockAuthProvider implements AuthProvider {
  async verifyToken(token: string): Promise<AuthUser> {
    return {
      firebaseUid: token,
      email: "student@example.com",
      displayName: "ExamInA Student"
    };
  }
}
