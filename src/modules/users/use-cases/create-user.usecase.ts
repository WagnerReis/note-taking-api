import { Either, left, right } from '@/core/either';
import { User } from '../entities/user.entity';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';
import { UserRepositoryInterface } from '../repositories/user.respository.interface';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';

interface CreateUserRequest {
  name?: string;
  email: string;
  password: string;
}

type CreateUserResponse = Either<UserAlreadyExistsError, { user: User }>;

@Injectable()
export class CreateUserUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute(data: CreateUserRequest): Promise<CreateUserResponse> {
    const { email, password } = data;

    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      return left(new UserAlreadyExistsError());
    }

    const passwordHash = await hash(password, 8);

    const user = User.create({
      email,
      password: passwordHash,
    });

    await this.userRepository.create(user);

    return right({ user });
  }
}
