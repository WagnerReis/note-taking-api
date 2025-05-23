import { SignInUseCase } from './sing-in.usecase';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { UnauthorizedException } from '@nestjs/common';

let inMemoryUsersRepository: InMemoryUsersRepository;
let bcryptHasher: FakeEncrypter;
let hashComparer: FakeHasher;
let sut: SignInUseCase;

describe('SignInUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    bcryptHasher = new FakeEncrypter();
    hashComparer = new FakeHasher();

    sut = new SignInUseCase(
      inMemoryUsersRepository,
      bcryptHasher,
      hashComparer,
    );
  });

  it('should return a access token', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUsersRepository.create(user);

    const result = await sut.execute('any_email', 'any_password');

    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
  });

  it('should return unauthorized error if email is invalid', async () => {
    const result = await sut.execute('invalid_email', 'any_password');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedException);
  });

  it('should return unauthorized error if password is invalid', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUsersRepository.create(user);

    const result = await sut.execute('any_email', 'invalid_password');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedException);
  });
});
