import type { AuthProvider, AuthUser } from "./auth-provider.interface";

export class FirebaseAuthProvider implements AuthProvider {
  async verifyToken(_token: string): Promise<AuthUser> {
    throw new Error("FirebaseAuthProvider is not configured yet.");
  }
}
