export interface AuthUser {
  firebaseUid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
}

export interface AuthProvider {
  verifyToken(token: string): Promise<AuthUser>;
}
