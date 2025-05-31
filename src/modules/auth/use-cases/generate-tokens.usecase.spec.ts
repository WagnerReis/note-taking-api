import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { GenerateTokensUseCase } from './generate-tokens.usecase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let bcryptHasher: FakeEncrypter;
let sut: GenerateTokensUseCase;

describe('GenerateTokensUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    bcryptHasher = new FakeEncrypter();

    sut = new GenerateTokensUseCase(bcryptHasher);
  });

  it('should return a access token and a refresh token', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password-hashed',
    });

    await inMemoryUsersRepository.create(user);

    const result = await sut.execute(user.id.toString());

    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
    expect(result.value).toHaveProperty('refreshToken');
  });
});
