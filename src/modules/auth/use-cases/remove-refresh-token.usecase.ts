import { Either, left, right } from '@/core/either';
import { UserRepositoryInterface } from '@/modules/users/repositories/user.respository.interface';
import { Injectable, NotFoundException } from '@nestjs/common';

type RemoveRefreshTokenResponse = Either<
  NotFoundException,
  { validUser: boolean }
>;

@Injectable()
export class RemoveRefreshTokenUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(userId: string): Promise<RemoveRefreshTokenResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new NotFoundException('User not found'));
    }

    user.refreshToken = '';

    await this.userRepository.update(user);

    return right({ validUser: true });
  }
}
