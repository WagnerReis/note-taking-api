import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GoogleUser,
  ValidateOrCreateGoogleUserUseCase,
} from './validate-or-create-google-user.usecase';
import { Either, left, right } from '@/core/either';
import { GenerateTokensUseCase } from './generate-tokens.usecase';
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';
import { HashGenerator } from '@/core/criptografhy/hash-generator';

type AuthenticateByGoogleResponse = Either<
  BadRequestException,
  { accessToken: string; refreshToken: string }
>;

@Injectable()
export class AuthenticateByGoogleUseCase {
  constructor(
    private readonly validateOrCreateGoogleUserUseCase: ValidateOrCreateGoogleUserUseCase,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly userRepository: UserRepositoryInterface,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(user: GoogleUser): Promise<AuthenticateByGoogleResponse> {
    const result = await this.validateOrCreateGoogleUserUseCase.execute(user);

    if (result.isLeft()) {
      return left(new BadRequestException());
    }

    const { user: userDb } = result.value;

    const resultTokens = await this.generateTokensUseCase.execute(
      userDb.id.toString(),
    );

    if (resultTokens.isLeft()) {
      return left(new BadRequestException());
    }

    const { accessToken, refreshToken } = resultTokens.value;

    userDb.refreshToken = await this.hashGenerator.hash(refreshToken);

    await this.userRepository.update(userDb);

    return right({ accessToken, refreshToken });
  }
}
