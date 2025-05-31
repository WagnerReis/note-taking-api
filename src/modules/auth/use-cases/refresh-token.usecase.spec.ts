import { JwtService } from '@nestjs/jwt';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { GenerateTokensUseCase } from './generate-tokens.usecase';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { EnvService } from '@/modules/env/env.service';
import { ConfigService } from '@nestjs/config';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { left, right } from '@/core/either';

let inMemoryUsersRepository: InMemoryUsersRepository;
let bcryptHasher: FakeEncrypter;
let hasher: FakeHasher;
let generateTokens: GenerateTokensUseCase;
let jwtService: JwtService;
let envService: EnvService;
let sut: RefreshTokenUseCase;

describe('RefreshTokenUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    hasher = new FakeHasher();
    bcryptHasher = new FakeEncrypter();
    generateTokens = new GenerateTokensUseCase(bcryptHasher);
    jwtService = new JwtService();
    envService = new EnvService(new ConfigService());

    sut = new RefreshTokenUseCase(
      inMemoryUsersRepository,
      jwtService,
      envService,
      generateTokens,
      hasher,
    );
  });

  it('should return UnauthorizedException when refresh token is missing', async () => {
    const result = await sut.execute('');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Missing refresh token');
  });

  it('should return UnauthorizedException when refresh token is invalid', async () => {
    vi.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error();
    });

    const result = await sut.execute('invalid_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Invalid refresh token');
  });
  it('should return NotFoundException when user is not found', async () => {
    vi.spyOn(jwtService, 'verify').mockReturnValue({
      sub: 'non_existent_user_id',
    });
    vi.spyOn(inMemoryUsersRepository, 'findById').mockResolvedValue(null);

    const result = await sut.execute('valid_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as NotFoundException;
    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.message).toBe('User not found');
  });

  it('should return UnauthorizedException when refresh token does not match', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id.toString() });
    vi.spyOn(inMemoryUsersRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(false);

    const result = await sut.execute('invalid_refresh_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as UnauthorizedException;
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Refresh token does not match');
  });

  it('should return BadRequestException when token generation fails', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id.toString() });
    vi.spyOn(inMemoryUsersRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(true);
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(left(null));

    const result = await sut.execute('valid_refresh_token');

    expect(result.isLeft()).toBe(true);
    const error = result.value as BadRequestException;
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.message).toBe('Failed to generate new tokens');
  });

  it('should successfully refresh tokens', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: user.id.toString() });
    vi.spyOn(inMemoryUsersRepository, 'findById').mockResolvedValue(user);
    vi.spyOn(hasher, 'compare').mockReturnValue(true);
    vi.spyOn(generateTokens, 'execute').mockResolvedValue(
      right({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      }),
    );

    const result = await sut.execute('valid_refresh_token');

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    });
  });
});
