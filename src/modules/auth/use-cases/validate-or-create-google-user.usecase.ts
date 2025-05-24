import { User } from '@/modules/users/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/modules/users/repositories/user.respository.interface';
import { Inject, Logger } from '@nestjs/common';

export interface GoogleUser {
  email: string;
  name: string;
  provider: string;
  googleId: string;
}

export class ValidateOrCreateGoogleUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: UserRepositoryInterface,
  ) {}

  private readonly logger = new Logger(ValidateOrCreateGoogleUserUseCase.name);

  async execute(user: GoogleUser) {
    const dbUser = await this.usersRepository.findByEmail(user.email);
    let userEntity: User;

    if (!dbUser) {
      this.logger.log('Creating user from google');
      userEntity = User.create({
        email: user.email,
        name: user.name,
        provider: user.provider,
        googleId: user.googleId,
        password: 'test1234',
      });

      await this.usersRepository.create(userEntity);

      return userEntity;
    }

    this.logger.log(`User with email ${user.email} found in db`);

    return dbUser;
  }
}
