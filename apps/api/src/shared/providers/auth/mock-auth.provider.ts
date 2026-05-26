import type { AuthLoginResult, AuthProvider, AuthUser } from "./auth-provider.interface";

export class MockAuthProvider implements AuthProvider {
  async registerWithEmailAndPassword(
    email: string,
    _password: string,
    displayName = "ExamInA Student"
  ): Promise<AuthLoginResult> {
    const formattedEmail = email.toLowerCase();
    const cleanEmail = formattedEmail.replace(/[^a-zA-Z0-9]/g, "-");
    const firebaseUid = `mock-uid-${cleanEmail}`;
    const token = `mock-token-${cleanEmail}`;

    return {
      user: {
        firebaseUid,
        email: formattedEmail,
        displayName: displayName || "ExamInA Student"
      },
      idToken: token,
      refreshToken: "local-refresh-token",
      expiresIn: 3600
    };
  }

  async signInWithEmailAndPassword(email: string): Promise<AuthLoginResult> {
    const formattedEmail = email.toLowerCase();
    const cleanEmail = formattedEmail.replace(/[^a-zA-Z0-9]/g, "-");
    const firebaseUid = `mock-uid-${cleanEmail}`;
    const token = `mock-token-${cleanEmail}`;

    return {
      user: {
        firebaseUid,
        email: formattedEmail,
        displayName: "ExamInA Student"
      },
      idToken: token,
      refreshToken: "local-refresh-token",
      expiresIn: 3600
    };
  }

  async verifyToken(token: string): Promise<AuthUser> {
    if (token.startsWith("mock-token-")) {
      const cleanEmail = token.replace("mock-token-", "");
      // Reconstruct a plausible email for the mock user
      const email = cleanEmail.includes("-at-")
        ? cleanEmail.replace("-at-", "@")
        : `${cleanEmail}@example.com`;

      return {
        firebaseUid: `mock-uid-${cleanEmail}`,
        email,
        displayName: "ExamInA Student"
      };
    }

    return {
      firebaseUid: token,
      email: "student@example.com",
      displayName: "ExamInA Student"
    };
  }
}
