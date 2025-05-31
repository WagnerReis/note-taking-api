import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserRepository } from '../users/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/models/user.model';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { ValidateOrCreateGoogleUserUseCase } from './use-cases/validate-or-create-google-user.usecase';
import { UserRepositoryInterface } from '../users/repositories/user.respository.interface';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthenticateByGoogleUseCase } from './use-cases/authenticate-by-google.usecase';
import { GenerateTokensUseCase } from './use-cases/generate-tokens.usecase';

@Module({
  imports: [
    EnvModule,
    CryptographyModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      global: true,
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: envService.get('JWT_EXPIRATION') + 'd',
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    SignInUseCase,
    GoogleStrategy,
    GenerateTokensUseCase,
    AuthenticateByGoogleUseCase,
    ValidateOrCreateGoogleUserUseCase,
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
