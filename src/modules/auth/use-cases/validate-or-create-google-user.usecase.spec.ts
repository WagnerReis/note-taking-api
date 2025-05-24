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
    const response = await sut.execute({
      email: 'any_email',
      name: 'any_name',
      googleId: 'any_google_id',
      provider: 'google',
    });

    expect(response).toBeInstanceOf(User);
    expect(response.email).toBe('any_email');
    expect(response.name).toBe('any_name');
    expect(response.googleId).toBe('any_google_id');
    expect(response.provider).toBe('google');
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

    const response = await sut.execute({
      email: 'any_email',
      name: 'any_name',
      googleId: 'any_google_id',
      provider: 'google',
    });

    expect(response).toBeInstanceOf(User);
    expect(response.email).toBe('any_email');
    expect(response.name).toBe('any_name');
    expect(response.provider).toBe('google');
    expect(response.googleId).toBe('any_google_id');
  });
});
