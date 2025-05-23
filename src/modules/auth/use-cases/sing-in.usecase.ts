import { Encrypter } from '@/core/criptografhy/encrypter';
import { HashCompare } from '@/core/criptografhy/hash-compare';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/modules/users/repositories/user.respository.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

type SignInResponse = {
  accessToken: string;
};

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
      throw new UnauthorizedException();
    }

    const isPasswordValid = this.hashCompare.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user.id.toString() };

    const accessToken = await this.encrypter.encrypt(payload);
    return { accessToken };
  }
}
