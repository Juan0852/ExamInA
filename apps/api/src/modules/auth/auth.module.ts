import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { FirebaseAuthProvider } from "../../shared/providers/auth/firebase-auth.provider";
import { AuthController } from "./controllers/auth.controller";
import { PrismaAuthRepository } from "./repositories/prisma-auth.repository";
import { AUTH_PROVIDER, AUTH_REPOSITORY, AuthService } from "./services/auth.service";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_PROVIDER,
      useFactory: () => new FirebaseAuthProvider()
    },
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
