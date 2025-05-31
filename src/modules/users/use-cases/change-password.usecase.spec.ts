import { makeUser } from 'test/factories/make-user.factory';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { ChangePasswordUseCase } from './change-password.usecase';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { BadRequestException, NotFoundException } from '@nestjs/common';

let inMemoryUsersRepository: InMemoryUsersRepository;
let hasher: FakeHasher;
let hashCompare: FakeHasher;
let sut: ChangePasswordUseCase;

describe('ChangePasswordUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    hasher = new FakeHasher();
    hashCompare = new FakeHasher();
    sut = new ChangePasswordUseCase(
      inMemoryUsersRepository,
      hashCompare,
      hasher,
    );
  });

  it('should change password with success', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const newPassword = 'any_password';

    const result = await sut.execute({
      userId: user.id.toString(),
      oldPassword: user.password.split('-')[0],
      newPassword,
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryUsersRepository.users[0].password).toEqual(
      `${newPassword}-hashed`,
    );
  });

  it('should throw an error if user not found', async () => {
    const result = await sut.execute({
      userId: 'non-existing-id',
      oldPassword: 'any_password',
      newPassword: 'any_password',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotFoundException);
  });

  it('should throw an error if password dont match', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      oldPassword: 'any_password',
      newPassword: 'new_password',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(BadRequestException);
  });
});
