import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/modules/users/repositories/user.respository.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

type SignInResponse = {
  accessToken: string;
};

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: UserRepositoryInterface,
    private jwtService: JwtService,
  ) {}

  async execute(email: string, pass: string): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user.id.toString() };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
