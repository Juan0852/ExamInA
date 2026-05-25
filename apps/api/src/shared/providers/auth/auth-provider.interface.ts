export interface AuthUser {
  firebaseUid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
}

export interface AuthLoginResult {
  user: AuthUser;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthProvider {
  registerWithEmailAndPassword(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthLoginResult>;
  signInWithEmailAndPassword(email: string, password: string): Promise<AuthLoginResult>;
  verifyToken(token: string): Promise<AuthUser>;
}
