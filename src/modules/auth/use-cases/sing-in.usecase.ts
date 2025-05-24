import { Encrypter } from '@/core/criptografhy/encrypter';
import { HashCompare } from '@/core/criptografhy/hash-compare';
import { Either, left, right } from '@/core/either';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/modules/users/repositories/user.respository.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

type SignInResponse = Either<
  UnauthorizedException,
  {
    accessToken: string;
  }
>;

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: UserRepositoryInterface,
    private encrypter: Encrypter,
    private hashCompare: HashCompare,
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

    const payload = { email: user.email, sub: user.id.toString() };

    const accessToken = await this.encrypter.encrypt(payload);
    return right({ accessToken });
  }
}
