import { ZodValidationPipe } from '@/core/pipes/zod-validation.pipe';
import {
  Controller,
  Post,
  Body,
  ConflictException,
  BadRequestException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { z } from 'zod';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UserAlreadyExistsError } from './use-cases/errors/user-already-exists-error';
import { SignInUseCase } from '../auth/use-cases/sing-in.usecase';
import { Response } from 'express';
import { EnvService } from '../env/env.service';
import { Public } from '../auth/decorators/public.decorator';
import { ChangePasswordUseCase } from './use-cases/change-password.usecase';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const createUserBodySchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

type CreateUserBody = z.infer<typeof createUserBodySchema>;

const changePasswordBodySchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

type ChangePasswordType = z.infer<typeof changePasswordBodySchema>;

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly envService: EnvService,
  ) {}

  @Public()
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

    const { accessToken, refreshToken } = resultSignIn.value;

    this.setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      success: true,
      message: 'Successfully signing up',
      status: 200,
    });
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(changePasswordBodySchema))
    body: ChangePasswordType,
    @Res() res: Response,
  ) {
    const { oldPassword, newPassword } = body;

    const result = await this.changePasswordUseCase.execute({
      userId,
      oldPassword,
      newPassword,
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

    return res.sendStatus(HttpStatus.OK);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('authToken', accessToken, commonOptions);
    res.cookie('refreshToken', refreshToken, commonOptions);
  }
}
