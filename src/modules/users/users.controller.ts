import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  BadRequestException,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateUserUseCase } from './use-cases/create-user';
import { UserAlreadyExistsError } from './use-cases/errors/user-already-exists-error';
import { SignInUseCase } from '../auth/use-cases/sing-in.usecase';
import { Response } from 'express';
import { EnvService } from '../env/env.service';

const createUserBodySchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

type CreateUserBody = z.infer<typeof createUserBodySchema>;

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly envService: EnvService,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserBodySchema)) body: CreateUserBody,
    @Res() res: Response,
  ) {
    const { email, password } = body;

    const result = await this.createUserUseCase.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { user } = result.value;

    const resultSignIn = await this.signInUseCase.execute(user.email, password);

    if (resultSignIn.isLeft()) {
      const error = resultSignIn.value;

      throw error;
    }

    const { accessToken } = resultSignIn.value;

    res.cookie('authToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge:
        Number(this.envService.get('JWT_EXPIRATION')) * 1000 * 60 * 60 * 24,
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @Get()
  findAll() {
    // implement
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // implement
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    // implement
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // implement
  }
}
