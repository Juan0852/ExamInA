import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { BadGatewayException, UnauthorizedException } from "@nestjs/common";
import type { AuthLoginResult, AuthProvider, AuthUser } from "./auth-provider.interface";

interface FirebasePasswordLoginResponse {
  localId: string;
  email?: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface FirebaseErrorResponse {
  error?: {
    message?: string;
  };
}

interface FirebaseServiceAccountFile {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

export class FirebaseAuthProvider implements AuthProvider {
  private readonly webApiKey: string;

  constructor() {
    const webApiKey = process.env.FIREBASE_WEB_API_KEY;

    if (!webApiKey) {
      throw new Error("FIREBASE_WEB_API_KEY is not configured.");
    }

    this.webApiKey = webApiKey;
  }

  async registerWithEmailAndPassword(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthLoginResult> {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.webApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const payload = (await response.json()) as FirebasePasswordLoginResponse & FirebaseErrorResponse;

    if (!response.ok) {
      this.handleAuthError(payload.error?.message);
    }

    return {
      user: {
        firebaseUid: payload.localId,
        email: payload.email,
        displayName
      },
      idToken: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresIn: Number(payload.expiresIn)
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthLoginResult> {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.webApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const payload = (await response.json()) as FirebasePasswordLoginResponse & FirebaseErrorResponse;

    if (!response.ok) {
      this.handleAuthError(payload.error?.message);
    }

    return {
      user: {
        firebaseUid: payload.localId,
        email: payload.email,
        displayName: payload.displayName
      },
      idToken: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresIn: Number(payload.expiresIn)
    };
  }

  async verifyToken(token: string): Promise<AuthUser> {
    this.initializeAdminApp();

    const decodedToken = await getAuth().verifyIdToken(token);

    return {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoUrl: decodedToken.picture
    };
  }

  private handleAuthError(message?: string): never {
    if (
      message === "EMAIL_NOT_FOUND" ||
      message === "INVALID_PASSWORD" ||
      message === "INVALID_LOGIN_CREDENTIALS" ||
      message === "USER_DISABLED" ||
      message === "EMAIL_EXISTS"
    ) {
      throw new UnauthorizedException("Invalid Firebase authentication request.");
    }

    throw new BadGatewayException("Firebase Authentication request failed.");
  }

  private initializeAdminApp(): void {
    if (getApps().length > 0) {
      return;
    }

    const serviceAccount = this.getServiceAccountCredentials();

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error("Firebase Admin environment variables are not configured.");
    }

    initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey
      })
    });
  }

  private getServiceAccountCredentials(): {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  } {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      const absolutePath = isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : join(process.cwd(), serviceAccountPath);

      if (!existsSync(absolutePath)) {
        throw new Error("Firebase service account file was not found.");
      }

      const serviceAccount = JSON.parse(
        readFileSync(absolutePath, "utf8")
      ) as FirebaseServiceAccountFile;

      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      };
    }

    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    };
  }
}
