import { Encrypter } from '@/core/criptografhy/encrypter';
import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt';

type GenerateTokensResponse = Either<
  null,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class GenerateTokensUseCase {
  constructor(private readonly encrypter: Encrypter<JwtSignOptions>) {}

  async execute(userId: string): Promise<GenerateTokensResponse> {
    const payload = { sub: userId };

    const accessToken = await this.encrypter.encrypt(payload, {
      expiresIn: '1d',
    });

    const refreshToken = await this.encrypter.encrypt(payload, {
      expiresIn: '7d',
    });

    return right({ accessToken, refreshToken });
  }
}
