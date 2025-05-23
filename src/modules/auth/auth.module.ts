import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserRepository } from '../users/repositories/user.repository';
import { USER_REPOSITORY } from '../users/repositories/user.respository.interface';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/models/user.model';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';
import { SignInUseCase } from './use-cases/sing-in.usecase';
import { CryptographyModule } from '../cryptography/cryptography.module';

@Module({
  imports: [
    UsersModule,
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
    SignInUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
