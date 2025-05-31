import { HashCompare } from '@/core/criptografhy/hash-compare';
import { Either, left, right } from '@/core/either';
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GenerateTokensUseCase } from './generate-tokens.usecase';

type SignInResponse = Either<
  UnauthorizedException | BadRequestException,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly hashCompare: HashCompare,
  ) {}

  async execute(email: string, pass: string): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new UnauthorizedException('User not found'));
    }

    const isPasswordValid = this.hashCompare.compare(pass, user.password);

    if (!isPasswordValid) {
      return left(new UnauthorizedException('Invalid password'));
    }

    const result = await this.generateTokensUseCase.execute(user.id.toString());

    if (result.isLeft()) {
      return left(new BadRequestException());
    }

    const { accessToken, refreshToken } = result.value;

    user.refreshToken = refreshToken;

    await this.userRepository.update(user);

    return right({ accessToken, refreshToken });
  }
}
