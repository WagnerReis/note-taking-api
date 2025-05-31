import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { GenerateTokensUseCase } from './generate-tokens.usecase';
import {
  GoogleUser,
  ValidateOrCreateGoogleUserUseCase,
} from './validate-or-create-google-user.usecase';
import { BadRequestException } from '@nestjs/common';
import { right, left } from '@/core/either';
import { AuthenticateByGoogleUseCase } from './authenticate-by-google.usecase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let bcryptHasher: FakeEncrypter;
let generateTokens: GenerateTokensUseCase;
let validateOrCreateGoogleUser: ValidateOrCreateGoogleUserUseCase;
let sut: AuthenticateByGoogleUseCase;

describe('AuthenticateByGoogleUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    bcryptHasher = new FakeEncrypter();
    generateTokens = new GenerateTokensUseCase(bcryptHasher);
    validateOrCreateGoogleUser = new ValidateOrCreateGoogleUserUseCase(
      inMemoryUsersRepository,
    );

    sut = new AuthenticateByGoogleUseCase(
      validateOrCreateGoogleUser,
      generateTokens,
      inMemoryUsersRepository,
    );
  });

  it('should authenticate a google user successfully', async () => {
    const googleUser = {
      email: 'any_email@google.com',
      name: 'Any Google User',
      id: 'google_id_123',
      provider: 'google',
      googleId: 'googleId',
    } as GoogleUser;

    const user = User.create({
      name: googleUser.name,
      email: googleUser.email,
      password: '',
    });

    vi.spyOn(validateOrCreateGoogleUser, 'execute').mockResolvedValue(
      right({ user }),
    );
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(
      right({
        accessToken: 'valid_access_token',
        refreshToken: 'valid_refresh_token',
      }),
    );

    const result = await sut.execute(googleUser);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: 'valid_access_token',
      refreshToken: 'valid_refresh_token',
    });
  });

  it('should return BadRequestException when validateOrCreateGoogleUser fails', async () => {
    const googleUser = {
      email: 'any_email@google.com',
      name: 'Any Google User',
      id: 'google_id_123',
      provider: 'google',
      googleId: 'googleId',
    } as GoogleUser;

    vi.spyOn(validateOrCreateGoogleUser, 'execute').mockResolvedValue(
      left(null),
    );

    const result = await sut.execute(googleUser);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);
  });
  it('should return BadRequestException when generateTokens fails', async () => {
    const googleUser = {
      email: 'any_email@google.com',
      name: 'Any Google User',
      id: 'google_id_123',
      provider: 'google',
      googleId: 'googleId',
    } as GoogleUser;

    const user = User.create({
      name: googleUser.name,
      email: googleUser.email,
      password: '',
    });

    vi.spyOn(validateOrCreateGoogleUser, 'execute').mockResolvedValue(
      right({ user }),
    );
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(left(null));

    const result = await sut.execute(googleUser);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestException);
  });

  it('should update user with refresh token after successful authentication', async () => {
    const googleUser = {
      email: 'any_email@google.com',
      name: 'Any Google User',
      id: 'google_id_123',
      provider: 'google',
      googleId: 'googleId',
    } as GoogleUser;

    const user = User.create({
      name: googleUser.name,
      email: googleUser.email,
      password: '',
    });

    vi.spyOn(validateOrCreateGoogleUser, 'execute').mockResolvedValue(
      right({ user }),
    );
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(
      right({
        accessToken: 'valid_access_token',
        refreshToken: 'valid_refresh_token',
      }),
    );
    const updateSpy = vi.spyOn(inMemoryUsersRepository, 'update');

    await sut.execute(googleUser);

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshToken: 'valid_refresh_token',
      }),
    );
  });
});
