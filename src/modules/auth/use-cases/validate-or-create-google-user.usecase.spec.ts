import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';
import { ValidateOrCreateGoogleUserUseCase } from './validate-or-create-google-user.usecase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: ValidateOrCreateGoogleUserUseCase;

describe('ValidateOrCreateGoogleUserUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new ValidateOrCreateGoogleUserUseCase(inMemoryUsersRepository);
  });

  it('should create a new user from google', async () => {
    const result = await sut.execute({
      email: 'any_email',
      name: 'any_name',
      googleId: 'any_google_id',
      provider: 'google',
    });

    if (result.isRight() && result.value) {
      const { user } = result.value;
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('any_email');
      expect(user.name).toBe('any_name');
      expect(user.googleId).toBe('any_google_id');
      expect(user.provider).toBe('google');
    }
  });

  it('should return a user if email exists', async () => {
    await inMemoryUsersRepository.create(
      User.create({
        email: 'any_email',
        name: 'any_name',
        password: '',
        googleId: 'any_google_id',
        provider: 'google',
      }),
    );

    const result = await sut.execute({
      email: 'any_email',
      name: 'any_name',
      googleId: 'any_google_id',
      provider: 'google',
    });

    if (result.isRight() && result.value) {
      const { user } = result.value;
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('any_email');
      expect(user.name).toBe('any_name');
      expect(user.provider).toBe('google');
      expect(user.googleId).toBe('any_google_id');
    }
  });
});
