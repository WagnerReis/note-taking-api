import { Either, left, right } from '@/core/either';
import { User } from '../entities/user.entity';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';
import { UserRepository } from '../repositories/user.repository';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../repositories/user.respository.interface';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

type CreateUserResponse = Either<UserAlreadyExistsError, { user: User }>;

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: UserRepository,
  ) {}

  async execute(data: CreateUserRequest): Promise<CreateUserResponse> {
    const { name, email, password } = data;

    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsError());
    }

    const user = User.create({
      name,
      email,
      password,
    });

    await this.userRepository.create(user);

    return right({ user });
  }
}
