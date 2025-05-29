import { Either, right } from '@/core/either';
import { User } from '@/modules/users/entities/user.entity';
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';
import { Injectable, Logger } from '@nestjs/common';

export interface GoogleUser {
  email: string;
  name: string;
  provider: string;
  googleId: string;
}

type ValidateUserResponse = Either<
  null,
  {
    user: User;
  }
>;

@Injectable()
export class ValidateOrCreateGoogleUserUseCase {
  constructor(private readonly usersRepository: UserRepositoryInterface) {}

  private readonly logger = new Logger(ValidateOrCreateGoogleUserUseCase.name);

  async execute(user: GoogleUser): Promise<ValidateUserResponse> {
    console.log(
      '🚀 ~ ValidateOrCreateGoogleUserUseCase ~ execute ~ this.usersRepository:',
      this.usersRepository,
    );
    const dbUser = await this.usersRepository.findByEmail(user.email);
    let userEntity: User;

    if (!dbUser) {
      this.logger.log('Creating user from google');
      userEntity = User.create({
        email: user.email,
        name: user.name,
        provider: user.provider,
        googleId: user.googleId,
        password: '',
      });

      await this.usersRepository.create(userEntity);

      return right({ user: userEntity });
    }

    this.logger.log(`User with email ${user.email} found in db`);

    return right({ user: dbUser });
  }
}
