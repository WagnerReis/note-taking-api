import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UserRepository } from './repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { EnvModule } from '../env/env.module';
import { SignInUseCase } from '../auth/use-cases/sing-in.usecase';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { UserRepositoryInterface } from './repositories/user.respository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EnvModule,
    CryptographyModule,
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    SignInUseCase,
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}
