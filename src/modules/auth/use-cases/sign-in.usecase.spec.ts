import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SignInUseCase } from './sing-in.usecase';
import { USER_REPOSITORY } from '@/modules/users/repositories/user.respository.interface';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-user.repository';
import { User } from '@/modules/users/entities/user.entity';

describe('SignInUseCase', () => {
  let service: SignInUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        JwtService,
        {
          provide: USER_REPOSITORY,
          useValue: InMemoryUsersRepository,
        },
      ],
    }).compile();

    service = module.get<SignInUseCase>(SignInUseCase);
    inMemoryUsersRepository =
      module.get<InMemoryUsersRepository>(USER_REPOSITORY);
  });

  // TODO: finish this test
  it('should be defined', async () => {
    const user = User.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });

    await inMemoryUsersRepository.create(user);

    const response = await service.execute('any_email', 'any_password');

    expect(response).toHaveProperty('accessToken');
  });
});
