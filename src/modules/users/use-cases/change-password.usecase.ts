import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepositoryInterface } from '../repositories/user.respository.interface';
import { HashGenerator } from '@/core/criptografhy/hash-generator';
import { Either, left, right } from '@/core/either';
import { HashCompare } from '@/core/criptografhy/hash-compare';

type ChangePasswordUseCaseInput = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};

type ChangePasswordUseCaseResponse = Either<
  NotFoundException,
  {
    message: string;
  }
>;

@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly hashCompare: HashCompare,
    private readonly hasher: HashGenerator,
  ) {}

  async execute({
    userId,
    oldPassword,
    newPassword,
  }: ChangePasswordUseCaseInput): Promise<ChangePasswordUseCaseResponse> {
    this.logger.log(`Changing password for user ${userId}`);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new NotFoundException('User not found'));
    }

    const oldPasswordHasMatched = this.hashCompare.compare(
      oldPassword,
      user.password,
    );

    if (!oldPasswordHasMatched) {
      return left(new BadRequestException('Old password does not match'));
    }

    const hashedPassword = await this.hasher.hash(newPassword);

    user.password = hashedPassword;

    await this.userRepository.update(user);
    this.logger.log(`Password changed for user ${userId}`);

    return right({ message: 'Password changed' });
  }
}
