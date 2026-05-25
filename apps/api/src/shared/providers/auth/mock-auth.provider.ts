import type { AuthLoginResult, AuthProvider, AuthUser } from "./auth-provider.interface";

export class MockAuthProvider implements AuthProvider {
  async registerWithEmailAndPassword(
    email: string,
    _password: string,
    displayName = "ExamInA Student"
  ): Promise<AuthLoginResult> {
    return {
      user: {
        firebaseUid: "local-test-token",
        email,
        displayName
      },
      idToken: "local-test-token",
      refreshToken: "local-refresh-token",
      expiresIn: 3600
    };
  }

  async signInWithEmailAndPassword(email: string): Promise<AuthLoginResult> {
    return {
      user: {
        firebaseUid: "local-test-token",
        email,
        displayName: "ExamInA Student"
      },
      idToken: "local-test-token",
      refreshToken: "local-refresh-token",
      expiresIn: 3600
    };
  }

  async verifyToken(token: string): Promise<AuthUser> {
    return {
      firebaseUid: token,
      email: "student@example.com",
      displayName: "ExamInA Student"
    };
  }
}
