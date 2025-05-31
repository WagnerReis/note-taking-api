import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { left, right, Either } from '@/core/either'; // ou sua própria implementação
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';
import { EnvService } from '@/modules/env/env.service';
import { GenerateTokensUseCase } from './generate-tokens.usecase';
import { HashCompare } from '@/core/criptografhy/hash-compare';

type Result = Either<
  UnauthorizedException | BadRequestException,
  { accessToken: string; refreshToken: string }
>;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly hashComparer: HashCompare,
  ) {}

  async execute(refreshToken: string): Promise<Result> {
    if (!refreshToken) {
      return left(new UnauthorizedException('Missing refresh token'));
    }

    let payload: { sub: string };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.envService.get('JWT_SECRET'),
      });
    } catch {
      return left(new UnauthorizedException('Invalid refresh token'));
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      return left(new NotFoundException('User not found'));
    }

    const refreshTokenHasMatch = this.hashComparer.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenHasMatch) {
      return left(new UnauthorizedException('Refresh token does not match'));
    }

    const tokensResult = await this.generateTokensUseCase.execute(payload.sub);

    if (tokensResult.isLeft()) {
      return left(new BadRequestException('Failed to generate new tokens'));
    }

    return right(tokensResult.value);
  }
}
