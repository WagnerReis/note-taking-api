import { User } from '@/modules/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { RemoveRefreshTokenUseCase } from './remove-refresh-token.usecase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: RemoveRefreshTokenUseCase;

describe('RemoveRefreshTokenUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new RemoveRefreshTokenUseCase(inMemoryUsersRepository);
  });

  it('should remove refresh token from user', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
      refreshToken: 'any_refresh_token',
    });

    await inMemoryUsersRepository.create(user);

    const result = await sut.execute(user.id.toString());

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.users[0].refreshToken).toBe('');
  });

  it('should throw an error if user not found in database', async () => {
    const result = await sut.execute('any_id');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundException);
  });
});
